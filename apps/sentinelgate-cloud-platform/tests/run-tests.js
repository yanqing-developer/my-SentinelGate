import assert from "node:assert/strict";
import localApp from "../../sentinelgate-local-agent/app.js";
import cloudApp from "../app.js";
import { resetScanDomainStore } from "../../sentinelgate-local-agent/store/scan-case-store.js";
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

const createServer = (app) => app.listen(0);

await run("happy-path ingestion stores a summary record", async () => {
  resetScanSummaryStore();
  const server = createServer(cloudApp);
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
  const server = createServer(cloudApp);
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
  const server = createServer(cloudApp);
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

await run("end-to-end flow moves a local cloudSafeSummary into cloud storage", async () => {
  resetScanDomainStore();
  resetScanSummaryStore();
  const localServer = createServer(localApp);
  const cloudServer = createServer(cloudApp);
  const localBaseUrl = `http://127.0.0.1:${localServer.address().port}`;
  const cloudBaseUrl = `http://127.0.0.1:${cloudServer.address().port}`;

  try {
    const localResponse = await fetch(`${localBaseUrl}/api/scan-cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rawText: "Confidential salary review for passport holder jane@example.com 123456789",
        immediateScan: true
      })
    });

    const localPayload = await localResponse.json();
    assert.equal("rawText" in localPayload.cloudSafeSummary, false);

    const cloudCreateResponse = await fetch(`${cloudBaseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(localPayload.cloudSafeSummary)
    });

    assert.equal(cloudCreateResponse.status, 202);
    const cloudCreatePayload = await cloudCreateResponse.json();

    const cloudReadResponse = await fetch(
      `${cloudBaseUrl}/api/scan-summaries/${cloudCreatePayload.record.id}`
    );
    const cloudReadPayload = await cloudReadResponse.json();

    assert.equal(cloudReadPayload.record.caseId, localPayload.scanCase.id);
    assert.equal(cloudReadPayload.record.riskLevel, localPayload.cloudSafeSummary.riskLevel);
    assert.equal("rawText" in cloudReadPayload.record, false);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
    await new Promise((resolve) => cloudServer.close(resolve));
  }
});

console.log("All cloud-platform tests passed.");
