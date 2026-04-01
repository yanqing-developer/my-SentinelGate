import {
  createLocalScanCase,
  getLocalScanCase,
  getLocalScanResult,
  scanExistingCase
} from "../services/scan-case-service.js";
import { createHttpError } from "../utils/http-error.js";
import { withErrorHandling } from "../utils/with-error-handling.js";

export const createScanCaseController = withErrorHandling(async (req, res) => {
  const { rawText, sourceType, immediateScan = false } = req.body ?? {};

  if (typeof rawText !== "string" || rawText.trim() === "") {
    req.logger.warn("scan_case.create.rejected", {
      reason: "missing_raw_text"
    });

    throw createHttpError(400, "VALIDATION_ERROR", "rawText is required.");
  }

  const response = createLocalScanCase({
    rawText,
    sourceType,
    immediateScan: Boolean(immediateScan),
    requestContext: {
      requestId: req.requestId,
      logger: req.logger
    }
  });

  res.status(201).json(response);
});

export const scanCaseController = withErrorHandling(async (req, res) => {
  const response = scanExistingCase(req.params.id, {
    requestId: req.requestId,
    logger: req.logger
  });

  res.status(200).json(response);
});

export const getScanCaseController = withErrorHandling(async (req, res) => {
  res.status(200).json({
    scanCase: getLocalScanCase(req.params.id)
  });
});

export const getScanResultController = withErrorHandling(async (req, res) => {
  res.status(200).json(
    getLocalScanResult(req.params.id, {
      requestId: req.requestId,
      logger: req.logger
    })
  );
});
