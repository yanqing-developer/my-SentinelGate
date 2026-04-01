import {
  getStoredScanSummary,
  ingestScanSummary,
  listStoredScanSummaries,
  listStoredScanSummariesByCaseId
} from "../services/scan-summary-service.js";
import { withErrorHandling } from "../utils/with-error-handling.js";

export const createScanSummaryController = withErrorHandling(async (req, res) => {
  req.logger.info("summary.ingestion.requested", {
    caseId: req.body?.caseId
  });

  const record = ingestScanSummary(req.body ?? {}, {
    requestId: req.requestId,
    logger: req.logger
  });

  res.status(202).json({
    record
  });
});

export const listScanSummariesController = withErrorHandling(async (req, res) => {
  const records = listStoredScanSummaries();

  req.logger.info("summary.listed", {
    recordCount: records.length
  });

  res.status(200).json({
    records
  });
});

export const getScanSummaryController = withErrorHandling(async (req, res) => {
  const record = getStoredScanSummary(req.params.id);

  req.logger.info("summary.fetched", {
    recordId: record.id,
    caseId: record.caseId
  });

  res.status(200).json({
    record
  });
});

export const listScanSummariesByCaseIdController = withErrorHandling(async (req, res) => {
  const records = listStoredScanSummariesByCaseId(req.params.caseId);

  req.logger.info("summary.case_listed", {
    caseId: req.params.caseId,
    recordCount: records.length
  });

  res.status(200).json({
    records
  });
});
