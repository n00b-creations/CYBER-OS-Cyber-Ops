import Redis from "ioredis";
import { prisma } from "@viralmint/db";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const stream = "viralmint:market-signals";
const group = "market-snapshot-writers";
const consumer = `processor-${process.pid}`;

async function ensureGroup() {
  try { await redis.xgroup("CREATE", stream, group, "0", "MKSTREAM"); }
  catch (error) {
    if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) throw error;
  }
}

function field(fields: string[], key: string) {
  const index = fields.indexOf(key);
  return index >= 0 ? fields[index + 1] : undefined;
}

async function processEntry(id: string, fields: string[]) {
  const raw = field(fields, "payload");
  if (!raw) return;
  const pair = JSON.parse(raw);
  const tx = pair.txns?.h24;
  const change = pair.priceChange?.h1;
  await prisma.marketSnapshot.create({
    data: {
      chainId: pair.chainId,
      dexId: pair.dexId,
      pairAddress: pair.pairAddress,
      baseAddress: pair.baseToken.address,
      baseSymbol: pair.baseToken.symbol,
      quoteAddress: pair.quoteToken?.address,
      quoteSymbol: pair.quoteToken?.symbol,
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
  await redis.xack(stream, group, id);
}

await ensureGroup();
console.log(`[processor] consuming ${stream} as ${consumer}`);

while (true) {
  const result = await redis.xreadgroup("GROUP", group, consumer, "COUNT", 25, "BLOCK", 5000, "STREAMS", stream, ">");
  if (!result) continue;
  for (const [, entries] of result) {
    for (const [id, fields] of entries) {
      try { await processEntry(id, fields); }
      catch (error) { console.error(`[processor] ${id} failed`, error); }
    }
  }
}
