export const evaluateRisk = (detectedSignals) => {
  if (!Array.isArray(detectedSignals) || detectedSignals.length === 0) {
    return {
      riskLevel: "LOW",
      recommendation: "ALLOW"
    };
  }

  if (detectedSignals.some((signal) => signal.severity === "HIGH")) {
    return {
      riskLevel: "HIGH",
      recommendation: "BLOCK"
    };
  }

  return {
    riskLevel: "MEDIUM",
    recommendation: "WARN"
  };
};
