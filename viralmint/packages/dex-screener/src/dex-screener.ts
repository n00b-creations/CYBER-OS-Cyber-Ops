import { z } from "zod";

const PairSchema = z.object({
  chainId: z.string(),
  dexId: z.string(),
  pairAddress: z.string(),
  baseToken: z.object({ address: z.string(), name: z.string(), symbol: z.string() }),
  quoteToken: z.object({ address: z.string(), name: z.string(), symbol: z.string() }),
  priceNative: z.string().optional(),
  priceUsd: z.string().nullable().optional(),
  txns: z.record(z.object({ buys: z.number(), sells: z.number() })).optional(),
  volume: z.record(z.number()).optional(),
  priceChange: z.record(z.number()).nullable().optional(),
  liquidity: z.object({ usd: z.number().nullable().optional(), base: z.number().nullable().optional(), quote: z.number().nullable().optional() }).nullable().optional(),
  fdv: z.number().nullable().optional(),
  marketCap: z.number().nullable().optional(),
  pairCreatedAt: z.number().nullable().optional(),
  boosts: z.object({ active: z.number() }).optional()
});

export type DexPair = z.infer<typeof PairSchema>;

export class DexScreenerClient {
  constructor(private readonly baseUrl = "https://api.dexscreener.com") {}

  private async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error(`DEX Screener HTTP ${response.status}`);
    return schema.parse(await response.json());
  }

  async search(query: string): Promise<DexPair[]> {
    const result = await this.get(`/latest/dex/search?q=${encodeURIComponent(query)}`,
      z.object({ pairs: z.array(PairSchema).optional() }));
    return result.pairs ?? [];
  }

  async getTokenPairs(chainId: string, tokenAddress: string): Promise<DexPair[]> {
    return this.get(`/token-pairs/v1/${chainId}/${tokenAddress}`, z.array(PairSchema));
  }

  async getTokens(chainId: string, tokenAddresses: string[]): Promise<DexPair[]> {
    if (tokenAddresses.length > 30) throw new Error("Maximum 30 token addresses per request");
    return this.get(`/tokens/v1/${chainId}/${tokenAddresses.join(",")}`, z.array(PairSchema));
  }

  async getPair(chainId: string, pairAddress: string): Promise<DexPair[]> {
    const result = await this.get(`/latest/dex/pairs/${chainId}/${pairAddress}`,
      z.object({ pairs: z.array(PairSchema).nullable().optional() }));
    return result.pairs ?? [];
  }
}
