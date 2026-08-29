import Redis from "ioredis";

export interface StreamRecord {
  id: string;
  fields: Record<string, string>;
}

export function createRedis(url = process.env.REDIS_URL ?? "redis://localhost:6379") {
  return new Redis(url);
}

export async function readStream(redis: Redis, stream: string, lastId = "$", count = 100): Promise<StreamRecord[]> {
  const result = await redis.xread("COUNT", count, "BLOCK", 5_000, "STREAMS", stream, lastId);
  if (!result) return [];
  const [, entries] = result[0] as [string, [string, string[]][]];
  return entries.map(([id, values]) => {
    const fields: Record<string, string> = {};
    for (let i = 0; i < values.length; i += 2) fields[values[i]] = values[i + 1];
    return { id, fields };
  });
}
