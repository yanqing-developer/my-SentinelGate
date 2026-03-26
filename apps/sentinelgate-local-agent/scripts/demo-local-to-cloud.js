const localBaseUrl = process.env.LOCAL_AGENT_URL || "http://127.0.0.1:3000";
const cloudBaseUrl = process.env.CLOUD_PLATFORM_URL || "http://127.0.0.1:4000";

const demoPayload = {
  rawText:
    "Confidential internal only salary review for passport holder jane@example.com 123456789",
  sourceType: "text",
  immediateScan: true
};

const run = async () => {
  const localResponse = await fetch(`${localBaseUrl}/api/scan-cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(demoPayload)
  });

  if (!localResponse.ok) {
    throw new Error(`Local agent request failed with status ${localResponse.status}`);
  }

  const localPayload = await localResponse.json();
  const summaryPayload = localPayload.cloudSafeSummary;

  const cloudCreateResponse = await fetch(`${cloudBaseUrl}/api/scan-summaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(summaryPayload)
  });

  if (!cloudCreateResponse.ok) {
    throw new Error(`Cloud platform request failed with status ${cloudCreateResponse.status}`);
  }

  const cloudCreatePayload = await cloudCreateResponse.json();
  const cloudReadResponse = await fetch(
    `${cloudBaseUrl}/api/scan-summaries/${cloudCreatePayload.record.id}`
  );

  if (!cloudReadResponse.ok) {
    throw new Error(`Cloud platform read failed with status ${cloudReadResponse.status}`);
  }

  const cloudReadPayload = await cloudReadResponse.json();

  console.log(
    JSON.stringify(
      {
        localCaseId: localPayload.scanCase.id,
        localRiskLevel: localPayload.scanResult.riskLevel,
        summaryPayload,
        storedCloudRecord: cloudReadPayload.record
      },
      null,
      2
    )
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
