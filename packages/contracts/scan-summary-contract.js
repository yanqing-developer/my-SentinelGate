export const SUMMARY_SIGNAL_FIELDS = ["type", "ruleId", "label", "severity"];
export const SUMMARY_REQUIRED_FIELDS = [
  "caseId",
  "detectedSignals",
  "riskLevel",
  "recommendation"
];
export const FORBIDDEN_RAW_FIELDS = ["rawText", "rawContent", "content", "text"];
export const ALLOWED_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];
export const ALLOWED_RECOMMENDATIONS = ["ALLOW", "WARN", "BLOCK"];

export const createScanSummarySignal = (signal) => ({
  type: signal.type,
  ruleId: signal.ruleId,
  label: signal.label,
  severity: signal.severity
});

export const createCloudSafeScanSummary = (scanResult) => ({
  caseId: scanResult.caseId,
  detectedSignals: scanResult.detectedSignals.map(createScanSummarySignal),
  riskLevel: scanResult.riskLevel,
  recommendation: scanResult.recommendation
});
