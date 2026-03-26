import assert from "node:assert/strict";
import app from "../app.js";
import { scanText } from "../services/local-scanner.js";
import { evaluateRisk } from "../services/risk-evaluator.js";
import { resetScanDomainStore } from "../store/scan-case-store.js";

const run = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

await run("scanner detects email addresses", async () => {
  const signals = scanText("Contact alice@example.com before release.");
  const emailSignal = signals.find((signal) => signal.ruleId === "email-address");

  assert.ok(emailSignal);
  assert.equal(emailSignal.severity, "LOW");
  assert.equal(emailSignal.matchPreview, "alice@example.com");
});

await run("scanner marks passport references as high severity", async () => {
  const signals = scanText("Passport copy attached for review.");
  const passportSignal = signals.find((signal) => signal.ruleId === "passport-reference");

  assert.ok(passportSignal);
  assert.equal(passportSignal.severity, "HIGH");
});

await run("risk evaluator blocks when a high severity signal exists", async () => {
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

await run("scan-case API supports create and result flow", async () => {
  resetScanDomainStore();

  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const createResponse = await fetch(`${baseUrl}/api/scan-cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rawText: "Internal only salary review for passport holder jane@example.com",
        immediateScan: true
      })
    });

    assert.equal(createResponse.status, 201);

    const createdPayload = await createResponse.json();
    assert.equal(createdPayload.scanCase.status, "SCANNED");
    assert.equal(createdPayload.scanResult.riskLevel, "HIGH");
    assert.equal(createdPayload.cloudSafeSummary.recommendation, "BLOCK");
    assert.equal("rawText" in createdPayload.cloudSafeSummary, false);

    const resultResponse = await fetch(`${baseUrl}/api/scan-cases/${createdPayload.scanCase.id}/result`);
    assert.equal(resultResponse.status, 200);

    const resultPayload = await resultResponse.json();
    assert.equal(resultPayload.scanResult.caseId, createdPayload.scanCase.id);
    assert.equal(resultPayload.cloudSafeSummary.caseId, createdPayload.scanCase.id);
    assert.equal("rawText" in resultPayload.cloudSafeSummary, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

console.log("All local-agent tests passed.");
