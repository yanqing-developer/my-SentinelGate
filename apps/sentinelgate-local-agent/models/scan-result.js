import { createCloudSafeScanSummary } from "../../../packages/contracts/scan-summary-contract.js";

export const createScanResult = ({
  caseId,
  detectedSignals,
  riskLevel,
  recommendation
}) => ({
  caseId,
  detectedSignals,
  riskLevel,
  recommendation,
  scannedAt: new Date().toISOString()
});

export const toCloudSafeSummary = (scanResult) => createCloudSafeScanSummary(scanResult);
