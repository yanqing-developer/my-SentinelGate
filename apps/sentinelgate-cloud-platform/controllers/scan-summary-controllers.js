import {
  getStoredScanSummary,
  ingestScanSummary,
  listStoredScanSummaries,
  listStoredScanSummariesByCaseId
} from "../services/scan-summary-service.js";

const sendError = (req, res, error) => {
  const statusCode = error.statusCode ?? 500;

  req.logger.error("summary.request.failed", {
    statusCode,
    error: error.message
  });

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Cloud summary request failed." : error.message
  });
};

export const createScanSummaryController = (req, res) => {
  req.logger.info("summary.ingestion.requested", {
    caseId: req.body?.caseId
  });

  try {
    const record = ingestScanSummary(req.body ?? {}, {
      requestId: req.requestId,
      logger: req.logger
    });
    return res.status(202).json({
      record
    });
  } catch (error) {
    req.logger.warn("summary.rejected", {
      caseId: req.body?.caseId,
      reason: error.message
    });

    return sendError(req, res, error);
  }
};

export const listScanSummariesController = (req, res) => {
  const records = listStoredScanSummaries();

  req.logger.info("summary.listed", {
    recordCount: records.length
  });

  return res.status(200).json({
    records
  });
};

export const getScanSummaryController = (req, res) => {
  try {
    const record = getStoredScanSummary(req.params.id);

    req.logger.info("summary.fetched", {
      recordId: record.id,
      caseId: record.caseId
    });

    return res.status(200).json({
      record
    });
  } catch (error) {
    return sendError(req, res, error);
  }
};

export const listScanSummariesByCaseIdController = (req, res) => {
  const records = listStoredScanSummariesByCaseId(req.params.caseId);

  req.logger.info("summary.case_listed", {
    caseId: req.params.caseId,
    recordCount: records.length
  });

  return res.status(200).json({
    records
  });
};
