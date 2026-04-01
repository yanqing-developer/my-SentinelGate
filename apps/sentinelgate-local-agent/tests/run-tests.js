import assert from "node:assert/strict";
import app from "../app.js";
import { scanText } from "../services/local-scanner.js";
import { evaluateRisk } from "../services/risk-evaluator.js";
import { resetScanDomainStore } from "../store/scan-case-store.js";
import {
  SUMMARY_REQUIRED_FIELDS,
  SUMMARY_SIGNAL_FIELDS,
  createCloudSafeScanSummary
} from "../../../packages/contracts/scan-summary-contract.js";

const run = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const startServer = async (expressApp) =>
  new Promise((resolve) => {
    const server = expressApp.listen(0, () => {
      resolve(server);
    });
  });

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

await run("cloudSafeSummary matches the shared contract fields", async () => {
  const summary = createCloudSafeScanSummary({
    caseId: "case-contract-1",
    detectedSignals: [
      {
        type: "EMAIL_ADDRESS",
        ruleId: "email-address",
        label: "Email address",
        severity: "LOW",
        explanation: "local only detail",
        matchPreview: "alice@example.com"
      }
    ],
    riskLevel: "MEDIUM",
    recommendation: "WARN"
  });

  assert.deepEqual(Object.keys(summary).sort(), [...SUMMARY_REQUIRED_FIELDS].sort());
  assert.deepEqual(Object.keys(summary.detectedSignals[0]).sort(), [...SUMMARY_SIGNAL_FIELDS].sort());
  assert.equal("rawText" in summary, false);
  assert.equal("explanation" in summary.detectedSignals[0], false);
});

await run("local-agent sets and preserves correlation headers", async () => {
  resetScanDomainStore();
  const server = await startServer(app);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const generatedResponse = await fetch(`${baseUrl}/api/health`);
    assert.ok(generatedResponse.headers.get("x-request-id"));
    assert.equal(
      generatedResponse.headers.get("x-request-id"),
      generatedResponse.headers.get("x-correlation-id")
    );

    const providedId = "local-correlation-123";
    const preservedResponse = await fetch(`${baseUrl}/api/health`, {
      headers: {
        "x-correlation-id": providedId
      }
    });

    assert.equal(preservedResponse.headers.get("x-request-id"), providedId);
    assert.equal(preservedResponse.headers.get("x-correlation-id"), providedId);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await run("local-agent validation errors use centralized error shape", async () => {
  resetScanDomainStore();
  const server = await startServer(app);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const correlationId = "local-error-123";

  try {
    const response = await fetch(`${baseUrl}/api/scan-cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId
      },
      body: JSON.stringify({
        immediateScan: true
      })
    });

    assert.equal(response.status, 400);
    assert.equal(response.headers.get("x-correlation-id"), correlationId);

    const payload = await response.json();
    assert.deepEqual(payload, {
      error: {
        code: "VALIDATION_ERROR",
        message: "rawText is required.",
        requestId: correlationId
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await run("local-agent not found uses centralized error shape", async () => {
  const server = await startServer(app);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const response = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(response.status, 404);

    const payload = await response.json();
    assert.equal(payload.error.code, "NOT_FOUND");
    assert.equal(payload.error.message, "Route not found.");
    assert.ok(payload.error.requestId);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await run("scan-case API supports create and result flow", async () => {
  resetScanDomainStore();

  const server = await startServer(app);
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
