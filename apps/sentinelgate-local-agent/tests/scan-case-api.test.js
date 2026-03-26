import test from "node:test";
import assert from "node:assert/strict";
import app from "../app.js";
import { resetScanDomainStore } from "../store/scan-case-store.js";

test("scan-case API supports create and result flow", async () => {
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
