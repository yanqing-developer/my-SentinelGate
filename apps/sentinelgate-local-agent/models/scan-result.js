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

export const toCloudSafeSummary = (scanResult) => ({
  caseId: scanResult.caseId,
  detectedSignals: scanResult.detectedSignals.map((signal) => ({
    type: signal.type,
    ruleId: signal.ruleId,
    label: signal.label,
    severity: signal.severity
  })),
  riskLevel: scanResult.riskLevel,
  recommendation: scanResult.recommendation
});
