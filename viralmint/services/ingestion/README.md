# Market Ingestion Worker

The ingestion worker polls configured DEX Screener search queries, applies deliberate pacing, and publishes normalized market observations to the Redis Stream `viralmint:market-signals`.

## Configuration

```bash
REDIS_URL=redis://localhost:6379
DEXSCREENER_BASE_URL=https://api.dexscreener.com
INGESTION_INTERVAL_MS=30000
INGESTION_QUERIES=SOL,ETH,PEPE,DOGE
```

This worker is intentionally a data-ingestion component only. It does not trade, deploy contracts, sign transactions, or make investment decisions.
