const FORBIDDEN_RAW_FIELDS = ["rawText", "rawContent", "content", "text"];
const ALLOWED_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];
const ALLOWED_RECOMMENDATIONS = ["ALLOW", "WARN", "BLOCK"];

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const validateDetectedSignal = (signal) => {
  if (!isPlainObject(signal)) {
    throw createHttpError("Each detected signal must be an object.", 400);
  }

  const { type, ruleId, label, severity } = signal;

  if (
    typeof type !== "string" ||
    typeof ruleId !== "string" ||
    typeof label !== "string" ||
    !ALLOWED_RISK_LEVELS.includes(severity)
  ) {
    throw createHttpError(
      "Each detected signal must include type, ruleId, label, and severity.",
      400
    );
  }
}

export const validateScanSummaryPayload = (payload) => {
  if (!isPlainObject(payload)) {
    throw createHttpError("Request body must be a JSON object.", 400);
  }

  const hasRawField = FORBIDDEN_RAW_FIELDS.some((field) => field in payload);

  if (hasRawField) {
    throw createHttpError("Raw text fields are not allowed in cloud-bound summary payloads.", 400);
  }

  const { caseId, detectedSignals, riskLevel, recommendation } = payload;

  if (typeof caseId !== "string" || caseId.trim() === "") {
    throw createHttpError("caseId is required.", 400);
  }

  if (!Array.isArray(detectedSignals)) {
    throw createHttpError("detectedSignals must be an array.", 400);
  }

  detectedSignals.forEach(validateDetectedSignal);

  if (!ALLOWED_RISK_LEVELS.includes(riskLevel)) {
    throw createHttpError("riskLevel must be LOW, MEDIUM, or HIGH.", 400);
  }

  if (!ALLOWED_RECOMMENDATIONS.includes(recommendation)) {
    throw createHttpError("recommendation must be ALLOW, WARN, or BLOCK.", 400);
  }

  return {
    caseId,
    detectedSignals,
    riskLevel,
    recommendation
  };
};
