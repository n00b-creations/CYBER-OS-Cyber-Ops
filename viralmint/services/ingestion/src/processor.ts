import { normalizePair } from "./normalize";
import type { StreamRecord } from "./stream";

export interface ProcessedSignal {
  source: "dexscreener";
  type: "MARKET";
  externalId: string;
  capturedAt: string;
  snapshot: ReturnType<typeof normalizePair>;
}

export function processMarketRecord(record: StreamRecord): ProcessedSignal | null {
  if (record.fields.type !== "MARKET" || !record.fields.payload) return null;
  try {
    const pair = JSON.parse(record.fields.payload);
    return {
      source: "dexscreener",
      type: "MARKET",
      externalId: `${pair.chainId}:${pair.pairAddress}`,
      capturedAt: record.fields.capturedAt ?? new Date().toISOString(),
      snapshot: normalizePair(pair, record.fields.capturedAt)
    };
  } catch {
    return null;
  }
}
