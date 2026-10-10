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
pnpm --filter @viralmint/db push
pnpm --filter @viralmint/api dev
pnpm --filter @viralmint/web dev
```

The API listens on `:4000`; the web app uses Next.js defaults on `:3000`. Set `WEB_ORIGIN` and `NEXT_PUBLIC_API_BASE_URL` in `.env` if the services run on different origins. The ingestion and processor workers can be started in separate terminals with `pnpm --filter @viralmint/ingestion dev` and `pnpm --filter @viralmint/processor dev` after the database schema has been generated and migrated.

## Validation and implementation status

Phase 1 is an in-progress prototype, not a production trading system. The dashboard now queries the Fastify API for live DEX Screener market pairs. Narrative scoring, social/news ingestion, risk validation, and simulation are not yet connected to this market-search screen.

The scoring package includes deterministic weighted scores and unit tests for repeatability, score bounds, competition weighting, and non-finite inputs. A GitHub Actions workflow has been added for scoring tests, package type-checks, and a web build. The first observed run failed during Prisma schema generation because enum values were written on one line; that schema format has been corrected. A successful post-fix run still needs to be observed before the branch can be considered validated.

Run the scoring tests from this directory after installing dependencies:

```bash
pnpm install
pnpm --filter @viralmint/scoring test
pnpm --filter @viralmint/scoring typecheck
```

Current known gaps:
- The web dashboard currently supports live DEX Screener market-pair search; it is not yet a narrative/opportunity dashboard and does not persist search results to the UI.
- The ingestion worker publishes market payloads to Redis, while the processor writes snapshots to PostgreSQL; the processor now reclaims stale pending entries, retries failed writes, sends repeatedly failing events to a bounded dead-letter stream, and uses the Redis stream entry ID as an idempotency key. Apply the Prisma schema with `pnpm --filter @viralmint/db push` before starting the processor.
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
