import Redis from "ioredis";
import { prisma } from "@viralmint/db";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const stream = "viralmint:market-signals";
const deadLetterStream = "viralmint:market-signals:dead-letter";
const group = "market-snapshot-writers";
const consumer = `processor-${process.pid}`;
const attemptsKey = "viralmint:market-signals:attempts";
const maxAttempts = Number(process.env.PROCESSOR_MAX_ATTEMPTS ?? 5);
const reclaimIdleMs = Number(process.env.PROCESSOR_RECLAIM_IDLE_MS ?? 60_000);

async function ensureGroup() {
  try {
    await redis.xgroup("CREATE", stream, group, "0", "MKSTREAM");
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
  }
}

function field(fields: string[], key: string) {
  const index = fields.indexOf(key);
  return index >= 0 ? fields[index + 1] : undefined;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code?: unknown }).code === "P2002";
}

async function acknowledge(id: string) {
  await redis.xack(stream, group, id);
  await redis.hdel(attemptsKey, id);
}

async function deadLetter(id: string, fields: string[], error: unknown) {
  await redis.xadd(
    deadLetterStream,
    "MAXLEN", "~", "5000", "*",
    "sourceStream", stream,
    "sourceId", id,
    "failedAt", new Date().toISOString(),
    "error", String(error).slice(0, 1000),
    "fields", JSON.stringify(fields)
  );
  await acknowledge(id);
  console.error(`[processor] dead-lettered ${id} after ${maxAttempts} attempts`);
}

async function processEntry(id: string, fields: string[]) {
  const raw = field(fields, "payload");
  if (!raw) throw new Error("Missing payload field");

  const pair = JSON.parse(raw) as Record<string, any>;
  const required = ["chainId", "dexId", "pairAddress"];
  for (const key of required) {
    if (typeof pair[key] !== "string" || !pair[key].trim()) {
      throw new Error(`Invalid or missing pair.${key}`);
    }
  }
  if (!pair.baseToken || typeof pair.baseToken.address !== "string" ||
      typeof pair.baseToken.symbol !== "string") {
    throw new Error("Invalid or missing pair.baseToken");
  }

  const tx = pair.txns?.h24;
  const change = pair.priceChange?.h1;

  try {
    await prisma.marketSnapshot.create({
      data: {
        streamEntryId: id,
        chainId: pair.chainId,
        dexId: pair.dexId,
        pairAddress: pair.pairAddress,
        baseAddress: pair.baseToken.address,
        baseSymbol: pair.baseToken.symbol,
        quoteAddress: pair.quoteToken?.address ?? null,
        quoteSymbol: pair.quoteToken?.symbol ?? null,
        priceUsd: pair.priceUsd ?? null,
        liquidityUsd: pair.liquidity?.usd ?? null,
        volume24h: pair.volume?.h24 ?? null,
        marketCap: pair.marketCap ?? null,
        fdv: pair.fdv ?? null,
        txBuys: tx?.buys ?? null,
        txSells: tx?.sells ?? null,
        priceChange1h: change ?? null,
        priceChange24h: pair.priceChange?.h24 ?? null,
        boostActive: pair.boosts?.active ?? null
      }
    });
  } catch (error) {
    // A redelivered stream entry may already have committed before the worker died.
    if (!isUniqueViolation(error)) throw error;
    console.info(`[processor] duplicate stream entry ${id}; acknowledging idempotently`);
  }

  await acknowledge(id);
}

async function handleEntries(entries: [string, string[]][]) {
  for (const [id, fields] of entries) {
    try {
      await processEntry(id, fields);
    } catch (error) {
      const attempts = await redis.hincrby(attemptsKey, id, 1);
      console.error(`[processor] ${id} failed (attempt ${attempts}/${maxAttempts})`, error);
      if (attempts >= maxAttempts) {
        try {
          await deadLetter(id, fields, error);
        } catch (deadLetterError) {
          // Keep the entry pending if the dead-letter write itself fails.
          console.error(`[processor] could not dead-letter ${id}`, deadLetterError);
        }
      }
    }
  }
}

await ensureGroup();
console.log(`[processor] consuming ${stream} as ${consumer}`);

while (true) {
  try {
    // Recover entries left pending by crashed or restarted consumers.
    const claimed = await redis.call(
      "XAUTOCLAIM", stream, group, consumer,
      String(reclaimIdleMs), "0-0", "COUNT", "25"
    ) as [string, [string, string[]][], string[]];

    if (claimed?.[1]?.length) await handleEntries(claimed[1]);

    const result = await redis.xreadgroup(
      "GROUP", group, consumer, "COUNT", 25, "BLOCK", 5000, "STREAMS", stream, ">"
    );
    if (!result) continue;

    for (const [, entries] of result) await handleEntries(entries);
  } catch (error) {
    console.error("[processor] stream loop failed; retrying in 2 seconds", error);
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
}
