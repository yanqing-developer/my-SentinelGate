import { randomUUID } from "node:crypto";

export const createScanSummaryRecord = ({
  caseId,
  detectedSignals,
  riskLevel,
  recommendation,
  source = "local-agent"
}) => ({
  id: randomUUID(),
  caseId,
  detectedSignals,
  riskLevel,
  recommendation,
  source,
  receivedAt: new Date().toISOString()
});
