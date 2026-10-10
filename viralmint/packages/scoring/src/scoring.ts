export interface ViralityInput {
  velocity: number;
  reach: number;
  novelty: number;
  crossPlatform: number;
  culturalRelevance: number;
  memeDurability: number;
  cryptoRelevance: number;
  /** Higher values mean more competing attention/opportunities. */
  competition: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function assertFiniteInputs(input: object, label: string): void {
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${label}.${key} must be a finite number`);
    }
  }
}

export function calculateViralityScore(input: ViralityInput): number {
  assertFiniteInputs(input, "virality");
  return Math.round(
    clamp(input.velocity) * 0.22 +
    clamp(input.reach) * 0.12 +
    clamp(input.novelty) * 0.15 +
    clamp(input.crossPlatform) * 0.13 +
    clamp(input.culturalRelevance) * 0.14 +
    clamp(input.memeDurability) * 0.10 +
    clamp(input.cryptoRelevance) * 0.09 +
    // Less competing attention makes a narrative more differentiated.
    (100 - clamp(input.competition)) * 0.05
  );
}

export interface OpportunityInput {
  virality: number;
  market: number;
  novelty: number;
  timing: number;
  safety: number;
  confidence: number;
}

export function calculateOpportunityScore(input: OpportunityInput): number {
  assertFiniteInputs(input, "opportunity");
  return Math.round(
    clamp(input.virality) * 0.35 +
    clamp(input.market) * 0.20 +
    clamp(input.novelty) * 0.10 +
    clamp(input.timing) * 0.15 +
    clamp(input.safety) * 0.05 +
    clamp(input.confidence) * 0.15
  );
}
