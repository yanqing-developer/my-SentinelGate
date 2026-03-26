import {
  getStoredScanSummary,
  ingestScanSummary,
  listStoredScanSummaries,
  listStoredScanSummariesByCaseId
} from "../services/scan-summary-service.js";

const sendError = (res, error) => {
  const statusCode = error.statusCode ?? 500;
  return res.status(statusCode).json({
    error: statusCode === 500 ? "Cloud summary request failed." : error.message
  });
};

export const createScanSummaryController = (req, res) => {
  try {
    const record = ingestScanSummary(req.body ?? {});
    return res.status(202).json({
      record
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const listScanSummariesController = (req, res) => {
  return res.status(200).json({
    records: listStoredScanSummaries()
  });
};

export const getScanSummaryController = (req, res) => {
  try {
    return res.status(200).json({
      record: getStoredScanSummary(req.params.id)
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const listScanSummariesByCaseIdController = (req, res) => {
  return res.status(200).json({
    records: listStoredScanSummariesByCaseId(req.params.caseId)
  });
};
