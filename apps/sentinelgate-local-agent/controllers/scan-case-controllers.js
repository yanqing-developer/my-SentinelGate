import {
  createLocalScanCase,
  getLocalScanCase,
  getLocalScanResult,
  scanExistingCase
} from "../services/scan-case-service.js";

const sendError = (res, error) => {
  const statusCode = error.statusCode ?? 500;
  return res.status(statusCode).json({
    error: statusCode === 500 ? "Local scan request failed." : error.message
  });
};

export const createScanCaseController = (req, res) => {
  const { rawText, sourceType, immediateScan = false } = req.body ?? {};

  if (typeof rawText !== "string" || rawText.trim() === "") {
    return res.status(400).json({
      error: "rawText is required."
    });
  }

  try {
    const response = createLocalScanCase({
      rawText,
      sourceType,
      immediateScan: Boolean(immediateScan)
    });

    return res.status(201).json(response);
  } catch (error) {
    return sendError(res, error);
  }
};

export const scanCaseController = (req, res) => {
  try {
    const response = scanExistingCase(req.params.id);
    return res.status(200).json(response);
  } catch (error) {
    return sendError(res, error);
  }
};

export const getScanCaseController = (req, res) => {
  try {
    return res.status(200).json({
      scanCase: getLocalScanCase(req.params.id)
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getScanResultController = (req, res) => {
  try {
    return res.status(200).json(getLocalScanResult(req.params.id));
  } catch (error) {
    return sendError(res, error);
  }
};
