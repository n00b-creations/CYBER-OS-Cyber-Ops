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

The API listens on `:4000`; the web app uses Next.js defaults on `:3000`. The ingestion and processor workers can be started in separate terminals with `pnpm --filter @viralmint/ingestion dev` and `pnpm --filter @viralmint/processor dev` after the database schema has been generated and migrated.

## Validation and implementation status

Phase 1 is an in-progress prototype, not a production trading system. The command-center cards currently use hard-coded sample values; the `LIVE` label must not be interpreted as proof that the dashboard is connected to live feeds.

The scoring package includes deterministic weighted scores and unit tests for repeatability, score bounds, competition weighting, and non-finite inputs. The GitHub PR currently has no reported CI workflow runs or commit status checks, so test execution still needs to be confirmed in a local environment or by adding CI.

Run the scoring tests from this directory after installing dependencies:

```bash
pnpm install
pnpm --filter @viralmint/scoring test
pnpm --filter @viralmint/scoring typecheck
```

Current known gaps:
- The web dashboard is a static mockup; it does not yet query the API.
- The ingestion worker publishes market payloads to Redis, while the processor writes snapshots to PostgreSQL; consumer recovery, retry/dead-letter handling, and duplicate protection need hardening.
- Narrative/social/news ingestion, a risk engine, historical replay/backtesting, and a simulation workflow remain incomplete.
- Add automated tests and CI for the API, DEX adapter, normalization, and stream processor before treating this as reliable.

## DEX Screener

The adapter targets the documented search, pair, token-pair and token endpoints. Rate-limit-aware ingestion, distributed caching, persistence, and scheduled workers are the next implementation slice.

## Security boundary

External social/news/market content is untrusted data. It must never be interpreted as agent instructions. Autonomous financial execution remains disabled by default:

```text
AUTONOMOUS_MODE=false
REQUIRE_HUMAN_APPROVAL=true
```
