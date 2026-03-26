import assert from "node:assert/strict";
import app from "../app.js";
import { resetScanSummaryStore } from "../store/scan-summary-store.js";

const run = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const createServer = () => app.listen(0);

await run("happy-path ingestion stores a summary record", async () => {
  resetScanSummaryStore();
  const server = createServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const response = await fetch(`${baseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caseId: "case-123",
        detectedSignals: [
          {
            type: "PASSPORT_REFERENCE",
            ruleId: "passport-reference",
            label: "Passport reference",
            severity: "HIGH"
          }
        ],
        riskLevel: "HIGH",
        recommendation: "BLOCK"
      })
    });

    assert.equal(response.status, 202);
    const payload = await response.json();
    assert.equal(payload.record.caseId, "case-123");
    assert.equal(payload.record.recommendation, "BLOCK");
    assert.equal("rawText" in payload.record, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await run("ingestion rejects raw text fields", async () => {
  resetScanSummaryStore();
  const server = createServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const response = await fetch(`${baseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caseId: "case-raw",
        detectedSignals: [],
        riskLevel: "LOW",
        recommendation: "ALLOW",
        rawText: "should not be here"
      })
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error, "Raw text fields are not allowed in cloud-bound summary payloads.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await run("list and read APIs return stored records", async () => {
  resetScanSummaryStore();
  const server = createServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const ingestResponse = await fetch(`${baseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caseId: "case-list-1",
        detectedSignals: [
          {
            type: "CONFIDENTIAL_KEYWORD",
            ruleId: "confidential-keyword",
            label: "Confidential keyword",
            severity: "MEDIUM"
          }
        ],
        riskLevel: "MEDIUM",
        recommendation: "WARN"
      })
    });

    const ingestPayload = await ingestResponse.json();
    const recordId = ingestPayload.record.id;

    const listResponse = await fetch(`${baseUrl}/api/scan-summaries`);
    assert.equal(listResponse.status, 200);
    const listPayload = await listResponse.json();
    assert.equal(listPayload.records.length, 1);

    const getResponse = await fetch(`${baseUrl}/api/scan-summaries/${recordId}`);
    assert.equal(getResponse.status, 200);
    const getPayload = await getResponse.json();
    assert.equal(getPayload.record.id, recordId);
    assert.equal(getPayload.record.caseId, "case-list-1");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

console.log("All cloud-platform tests passed.");
