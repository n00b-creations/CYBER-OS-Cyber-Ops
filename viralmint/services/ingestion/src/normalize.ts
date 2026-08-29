export interface CanonicalMarketSnapshot {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseAddress: string;
  baseSymbol: string;
  quoteAddress: string;
  quoteSymbol: string;
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  marketCap: number | null;
  fdv: number | null;
  buys24h: number;
  sells24h: number;
  priceChange1h: number | null;
  priceChange24h: number | null;
  boostActive: number;
  capturedAt: string;
}

const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function normalizePair(pair: any, capturedAt = new Date().toISOString()): CanonicalMarketSnapshot {
  const tx24 = pair.txns?.h24 ?? {};
  const changes = pair.priceChange ?? {};
  return {
    chainId: String(pair.chainId),
    dexId: String(pair.dexId),
    pairAddress: String(pair.pairAddress),
    baseAddress: String(pair.baseToken.address),
    baseSymbol: String(pair.baseToken.symbol),
    quoteAddress: String(pair.quoteToken.address),
    quoteSymbol: String(pair.quoteToken.symbol),
    priceUsd: num(pair.priceUsd),
    liquidityUsd: num(pair.liquidity?.usd),
    volume24h: num(pair.volume?.h24),
    marketCap: num(pair.marketCap),
    fdv: num(pair.fdv),
    buys24h: Number(tx24.buys ?? 0),
    sells24h: Number(tx24.sells ?? 0),
    priceChange1h: num(changes.h1),
    priceChange24h: num(changes.h24),
    boostActive: Number(pair.boosts?.active ?? 0),
    capturedAt
  };
}
