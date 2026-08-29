# ViralMint — Phase 1

ViralMint is the narrative-intelligence layer for autonomous memecoin opportunity research. Phase 1 establishes a standalone application boundary inside CYBER-OS with a typed API, market-data adapter, deterministic scoring package, PostgreSQL model, Redis development services, and a first command-center UI.

## Architecture

```text
Signals / DEX data
        ↓
  ingestion adapters
        ↓
 market snapshots
        ↓
 deterministic scoring
        ↓
 opportunity queue
        ↓
 AI analysis (Phase 2+)
        ↓
 risk + simulation
        ↓
 human approval gate
```

The system does not execute trades or deploy tokens autonomously. Approval is an explicit control-plane boundary.

## Phase 1 tree

```text
viralmint/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── db/
│   ├── dex-screener/
│   └── scoring/
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

## Run

```bash
cd viralmint
cp .env.example .env
pnpm install

docker compose up -d

pnpm --filter @viralmint/db generate
pnpm --filter @viralmint/api dev
pnpm --filter @viralmint/web dev
```

The API listens on `:4000`; the web app uses Next.js defaults on `:3000`.

## DEX Screener

The adapter targets the documented search, pair, token-pair and token endpoints. Rate-limit-aware ingestion, distributed caching, persistence, and scheduled workers are the next implementation slice.

## Security boundary

External social/news/market content is untrusted data. It must never be interpreted as agent instructions. Autonomous financial execution remains disabled by default:

```text
AUTONOMOUS_MODE=false
REQUIRE_HUMAN_APPROVAL=true
```
