export interface ViralityInput {
  velocity: number;
  reach: number;
  novelty: number;
  crossPlatform: number;
  culturalRelevance: number;
  memeDurability: number;
  cryptoRelevance: number;
  competition: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function calculateViralityScore(input: ViralityInput): number {
  return Math.round(clamp(
    input.velocity * 0.22 +
    input.reach * 0.12 +
    input.novelty * 0.15 +
    input.crossPlatform * 0.13 +
    input.culturalRelevance * 0.14 +
    input.memeDurability * 0.10 +
    input.cryptoRelevance * 0.09 +
    input.competition * 0.05
  ));
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
  return Math.round(clamp(
    input.virality * 0.35 +
    input.market * 0.20 +
    input.novelty * 0.10 +
    input.timing * 0.15 +
    input.safety * 0.05 +
    input.confidence * 0.15
  ));
}
