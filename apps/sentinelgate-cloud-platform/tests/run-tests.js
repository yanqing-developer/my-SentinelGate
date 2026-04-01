import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import localApp from "../../sentinelgate-local-agent/app.js";
import cloudApp from "../app.js";
import { resetScanDomainStore } from "../../sentinelgate-local-agent/store/scan-case-store.js";
import {
  closeScanSummaryStore,
  initializeScanSummaryStore,
  resetScanSummaryStore
} from "../store/scan-summary-store.js";

const run = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const startServer = async (app) =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });

const createTestDatabasePath = () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "sentinelgate-cloud-"));
  return {
    dbPath: path.join(directory, "scan-summaries.sqlite"),
    cleanup() {
      closeScanSummaryStore();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  };
};

await run("happy-path ingestion stores a summary record", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
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
    storage.cleanup();
  }
});

await run("cloud-platform sets and preserves correlation headers", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const generatedResponse = await fetch(`${baseUrl}/health`);
    assert.ok(generatedResponse.headers.get("x-request-id"));

    const providedId = "cloud-correlation-123";
    const preservedResponse = await fetch(`${baseUrl}/health`, {
      headers: {
        "x-request-id": providedId
      }
    });

    assert.equal(preservedResponse.headers.get("x-request-id"), providedId);
    assert.equal(preservedResponse.headers.get("x-correlation-id"), providedId);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.cleanup();
  }
});

await run("cloud validation errors use centralized error shape", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const correlationId = "cloud-error-123";

  try {
    const response = await fetch(`${baseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId
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
    assert.equal(response.headers.get("x-correlation-id"), correlationId);

    const payload = await response.json();
    assert.deepEqual(payload, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Raw text fields are not allowed in cloud-bound summary payloads.",
        requestId: correlationId
      }
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.cleanup();
  }
});

await run("cloud not found uses centralized error shape", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const response = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(response.status, 404);

    const payload = await response.json();
    assert.equal(payload.error.code, "NOT_FOUND");
    assert.equal(payload.error.message, "Route not found.");
    assert.ok(payload.error.requestId);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.cleanup();
  }
});

await run("list and read APIs return stored records", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
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
    storage.cleanup();
  }
});

await run("summary records persist across storage reinitialization", async () => {
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const server = await startServer(cloudApp);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const ingestResponse = await fetch(`${baseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caseId: "case-persist-1",
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

    closeScanSummaryStore();
    initializeScanSummaryStore(storage.dbPath);

    const readResponse = await fetch(`${baseUrl}/api/scan-summaries/${recordId}`);
    assert.equal(readResponse.status, 200);

    const readPayload = await readResponse.json();
    assert.equal(readPayload.record.id, recordId);
    assert.equal(readPayload.record.caseId, "case-persist-1");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.cleanup();
  }
});

await run("end-to-end flow preserves correlation id from local to cloud", async () => {
  resetScanDomainStore();
  const storage = createTestDatabasePath();
  initializeScanSummaryStore(storage.dbPath);
  resetScanSummaryStore();
  const localServer = await startServer(localApp);
  const cloudServer = await startServer(cloudApp);
  const localBaseUrl = `http://127.0.0.1:${localServer.address().port}`;
  const cloudBaseUrl = `http://127.0.0.1:${cloudServer.address().port}`;
  const correlationId = "flow-correlation-123";

  try {
    const localResponse = await fetch(`${localBaseUrl}/api/scan-cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId
      },
      body: JSON.stringify({
        rawText: "Confidential salary review for passport holder jane@example.com 123456789",
        immediateScan: true
      })
    });

    const localPayload = await localResponse.json();
    assert.equal(localResponse.headers.get("x-correlation-id"), correlationId);
    assert.equal("rawText" in localPayload.cloudSafeSummary, false);

    const cloudCreateResponse = await fetch(`${cloudBaseUrl}/api/scan-summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId
      },
      body: JSON.stringify(localPayload.cloudSafeSummary)
    });

    assert.equal(cloudCreateResponse.status, 202);
    assert.equal(cloudCreateResponse.headers.get("x-correlation-id"), correlationId);
    const cloudCreatePayload = await cloudCreateResponse.json();

    const cloudReadResponse = await fetch(
      `${cloudBaseUrl}/api/scan-summaries/${cloudCreatePayload.record.id}`,
      {
        headers: {
          "x-correlation-id": correlationId
        }
      }
    );
    const cloudReadPayload = await cloudReadResponse.json();

    assert.equal(cloudReadResponse.headers.get("x-correlation-id"), correlationId);
    assert.equal(cloudReadPayload.record.caseId, localPayload.scanCase.id);
    assert.equal(cloudReadPayload.record.riskLevel, localPayload.cloudSafeSummary.riskLevel);
    assert.equal("rawText" in cloudReadPayload.record, false);
  } finally {
    await new Promise((resolve) => localServer.close(resolve));
    await new Promise((resolve) => cloudServer.close(resolve));
    storage.cleanup();
  }
});

console.log("All cloud-platform tests passed.");
