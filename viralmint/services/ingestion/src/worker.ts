import Redis from "ioredis";
import { DexScreenerClient } from "@viralmint/dex-screener";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
const dex = new DexScreenerClient(process.env.DEXSCREENER_BASE_URL);
const intervalMs = Number(process.env.INGESTION_INTERVAL_MS ?? 30_000);
const queries = (process.env.INGESTION_QUERIES ?? "SOL,ETH,PEPE,DOGE").split(",").map(s => s.trim()).filter(Boolean);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function publish(query: string) {
  const pairs = await dex.search(query);
  const capturedAt = new Date().toISOString();
  for (const pair of pairs) {
    await redis.xadd(
      "viralmint:market-signals",
      "MAXLEN", "~", "10000", "*",
      "type", "MARKET",
      "query", query,
      "capturedAt", capturedAt,
      "payload", JSON.stringify(pair)
    );
  }
  console.log(`[ingestion] ${query}: ${pairs.length} pairs`);
}

async function runCycle() {
  for (const query of queries) {
    try {
      await publish(query);
    } catch (error) {
      console.error(`[ingestion] ${query} failed`, error);
    }
    // Deliberate pacing between external API requests.
    await sleep(1_000);
  }
}

await runCycle();
setInterval(() => void runCycle(), intervalMs);
