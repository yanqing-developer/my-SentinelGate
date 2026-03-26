import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRisk } from "../services/risk-evaluator.js";

test("risk evaluator blocks when a high severity signal exists", () => {
  const decision = evaluateRisk([
    {
      type: "PASSPORT_REFERENCE",
      ruleId: "passport-reference",
      label: "Passport reference",
      severity: "HIGH"
    }
  ]);

  assert.deepEqual(decision, {
    riskLevel: "HIGH",
    recommendation: "BLOCK"
  });
});
