import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { DexScreenerClient } from "@viralmint/dex-screener";
import { calculateOpportunityScore, calculateViralityScore } from "@viralmint/scoring";

const app = Fastify({ logger: true });
const dex = new DexScreenerClient(process.env.DEXSCREENER_BASE_URL);

await app.register(cors, { origin: true });
await app.register(sensible);

app.get("/health", async () => ({ status: "ok", service: "viralmint-api" }));

app.get("/api/v1/markets/search", async (request) => {
  const { q } = request.query as { q?: string };
  if (!q) throw app.httpErrors.badRequest("q is required");
  return { query: q, pairs: await dex.search(q) };
});

app.get("/api/v1/scoring/demo", async () => {
  const virality = calculateViralityScore({
    velocity: 94, reach: 82, novelty: 91, crossPlatform: 88,
    culturalRelevance: 96, memeDurability: 79, cryptoRelevance: 86, competition: 70
  });
  const opportunity = calculateOpportunityScore({
    virality, market: 84, novelty: 91, timing: 89, safety: 92, confidence: 82
  });
  return { virality, opportunity };
});

const port = Number(process.env.API_PORT ?? 4000);
await app.listen({ host: "0.0.0.0", port });
