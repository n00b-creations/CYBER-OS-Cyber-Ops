import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateOpportunityScore,
  calculateViralityScore,
  type OpportunityInput,
  type ViralityInput
} from "./scoring";

const viralityInput: ViralityInput = {
  velocity: 50,
  reach: 50,
  novelty: 50,
  crossPlatform: 50,
  culturalRelevance: 50,
  memeDurability: 50,
  cryptoRelevance: 50,
  competition: 50
};

const opportunityInput: OpportunityInput = {
  virality: 50,
  market: 50,
  novelty: 50,
  timing: 50,
  safety: 50,
  confidence: 50
};

test("virality score is deterministic and returns the expected midpoint", () => {
  assert.equal(calculateViralityScore(viralityInput), 50);
});

test("lower competition improves the virality score", () => {
  assert.ok(
    calculateViralityScore({ ...viralityInput, competition: 10 }) >
    calculateViralityScore({ ...viralityInput, competition: 90 })
  );
});

test("scores clamp finite inputs to the 0–100 range", () => {
  assert.equal(calculateViralityScore({ ...viralityInput, velocity: 1_000 }), 61);
  assert.equal(calculateOpportunityScore({ ...opportunityInput, market: -1_000 }), 40);
});

test("virality score rejects non-finite input rather than returning NaN", () => {
  assert.throws(
    () => calculateViralityScore({ ...viralityInput, velocity: Number.NaN }),
    /virality\.velocity must be a finite number/
  );
});

test("opportunity score rejects infinite input", () => {
  assert.throws(
    () => calculateOpportunityScore({ ...opportunityInput, confidence: Number.POSITIVE_INFINITY }),
    /opportunity\.confidence must be a finite number/
  );
});

test("opportunity score is deterministic and bounded", () => {
  assert.equal(calculateOpportunityScore(opportunityInput), 50);
  assert.equal(calculateOpportunityScore({ ...opportunityInput, safety: 100 }), 53);
});
