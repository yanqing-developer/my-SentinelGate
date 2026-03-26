import { createScanSummaryRecord } from "../models/scan-summary-record.js";
import {
  getScanSummaryRecordById,
  listScanSummaryRecords,
  listScanSummaryRecordsByCaseId,
  saveScanSummaryRecord
} from "../store/scan-summary-store.js";
import { validateScanSummaryPayload } from "./scan-summary-validator.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const ingestScanSummary = (payload, requestContext) => {
  const validatedPayload = validateScanSummaryPayload(payload);
  const record = saveScanSummaryRecord(createScanSummaryRecord(validatedPayload));

  requestContext?.logger?.info("summary.accepted", {
    recordId: record.id,
    caseId: record.caseId,
    riskLevel: record.riskLevel,
    recommendation: record.recommendation,
    detectedSignalCount: record.detectedSignals.length
  });

  return record;
};

export const getStoredScanSummary = (recordId) => {
  const record = getScanSummaryRecordById(recordId);

  if (!record) {
    throw createHttpError("Scan summary record not found.", 404);
  }

  return record;
};

export const listStoredScanSummaries = () => listScanSummaryRecords();

export const listStoredScanSummariesByCaseId = (caseId) => listScanSummaryRecordsByCaseId(caseId);
