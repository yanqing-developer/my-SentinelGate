import {
  ALLOWED_RECOMMENDATIONS,
  ALLOWED_RISK_LEVELS,
  FORBIDDEN_RAW_FIELDS,
  SUMMARY_REQUIRED_FIELDS,
  SUMMARY_SIGNAL_FIELDS
} from "../../../packages/contracts/scan-summary-contract.js";
import { createHttpError } from "../utils/http-error.js";

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const hasOnlyFields = (value, allowedFields) =>
  Object.keys(value).every((field) => allowedFields.includes(field));

const validateDetectedSignal = (signal) => {
  if (!isPlainObject(signal) || !hasOnlyFields(signal, SUMMARY_SIGNAL_FIELDS)) {
    throw createHttpError(
      400,
      "VALIDATION_ERROR",
      "Each detected signal must only include type, ruleId, label, and severity."
    );
  }

  const { type, ruleId, label, severity } = signal;

  if (
    typeof type !== "string" ||
    typeof ruleId !== "string" ||
    typeof label !== "string" ||
    !ALLOWED_RISK_LEVELS.includes(severity)
  ) {
    throw createHttpError(
      400,
      "VALIDATION_ERROR",
      "Each detected signal must include type, ruleId, label, and severity."
    );
  }
};

export const validateScanSummaryPayload = (payload) => {
  if (!isPlainObject(payload)) {
    throw createHttpError(400, "VALIDATION_ERROR", "Request body must be a JSON object.");
  }

  const hasRawField = FORBIDDEN_RAW_FIELDS.some((field) => field in payload);

  if (hasRawField) {
    throw createHttpError(
      400,
      "VALIDATION_ERROR",
      "Raw text fields are not allowed in cloud-bound summary payloads."
    );
  }

  if (!hasOnlyFields(payload, SUMMARY_REQUIRED_FIELDS)) {
    throw createHttpError(
      400,
      "VALIDATION_ERROR",
      "Scan summary payload may only include caseId, detectedSignals, riskLevel, and recommendation."
    );
  }

  const { caseId, detectedSignals, riskLevel, recommendation } = payload;

  if (typeof caseId !== "string" || caseId.trim() === "") {
    throw createHttpError(400, "VALIDATION_ERROR", "caseId is required.");
  }

  if (!Array.isArray(detectedSignals)) {
    throw createHttpError(400, "VALIDATION_ERROR", "detectedSignals must be an array.");
  }

  detectedSignals.forEach(validateDetectedSignal);

  if (!ALLOWED_RISK_LEVELS.includes(riskLevel)) {
    throw createHttpError(400, "VALIDATION_ERROR", "riskLevel must be LOW, MEDIUM, or HIGH.");
  }

  if (!ALLOWED_RECOMMENDATIONS.includes(recommendation)) {
    throw createHttpError(400, "VALIDATION_ERROR", "recommendation must be ALLOW, WARN, or BLOCK.");
  }

  return {
    caseId,
    detectedSignals,
    riskLevel,
    recommendation
  };
};
