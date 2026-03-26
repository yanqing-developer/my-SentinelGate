import { createScanCase, toPublicScanCase } from "../models/scan-case.js";
import { createScanResult, toCloudSafeSummary } from "../models/scan-result.js";
import {
  getScanCaseById,
  getScanResultByCaseId,
  saveScanCase,
  saveScanResult,
  updateScanCase
} from "../store/scan-case-store.js";
import {
  assertScanCaseTransition,
  SCANCASESTATUS
} from "../utils/scan-case-status.js";
import { scanText } from "./local-scanner.js";
import { evaluateRisk } from "./risk-evaluator.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const markScanCaseStatus = (scanCase, nextStatus) => ({
  ...scanCase,
  status: assertScanCaseTransition(scanCase.status, nextStatus),
  updatedAt: new Date().toISOString()
});

const buildSummary = (scanResult, requestContext) => {
  const cloudSafeSummary = toCloudSafeSummary(scanResult);

  requestContext?.logger?.info("scan.summary.built", {
    caseId: scanResult.caseId,
    riskLevel: cloudSafeSummary.riskLevel,
    recommendation: cloudSafeSummary.recommendation,
    detectedSignalCount: cloudSafeSummary.detectedSignals.length
  });

  return cloudSafeSummary;
};

export const createLocalScanCase = ({
  rawText,
  sourceType = "text",
  immediateScan = false,
  requestContext
}) => {
  const scanCase = saveScanCase(createScanCase({ rawText, sourceType }));

  requestContext?.logger?.info("scan_case.created", {
    caseId: scanCase.id,
    sourceType: scanCase.sourceType,
    immediateScan
  });

  if (!immediateScan) {
    return {
      scanCase: toPublicScanCase(scanCase),
      scanResult: null,
      cloudSafeSummary: null
    };
  }

  return scanExistingCase(scanCase.id, requestContext);
};

export const getLocalScanCase = (caseId) => {
  const scanCase = getScanCaseById(caseId);

  if (!scanCase) {
    throw createHttpError("Scan case not found.", 404);
  }

  return toPublicScanCase(scanCase);
};

export const getLocalScanResult = (caseId, requestContext) => {
  const scanCase = getScanCaseById(caseId);

  if (!scanCase) {
    throw createHttpError("Scan case not found.", 404);
  }

  const scanResult = getScanResultByCaseId(caseId);

  if (!scanResult) {
    throw createHttpError("Scan result not found for this case.", 404);
  }

  return {
    scanResult,
    cloudSafeSummary: buildSummary(scanResult, requestContext)
  };
};

export const scanExistingCase = (caseId, requestContext) => {
  const scanCase = getScanCaseById(caseId);

  if (!scanCase) {
    throw createHttpError("Scan case not found.", 404);
  }

  if (scanCase.status !== SCANCASESTATUS.DRAFT) {
    throw createHttpError("Scan case can only be scanned from DRAFT state.", 400);
  }

  requestContext?.logger?.info("scan.started", {
    caseId
  });

  const scanningCase = updateScanCase(caseId, (currentScanCase) =>
    markScanCaseStatus(currentScanCase, SCANCASESTATUS.SCANNING)
  );

  try {
    const detectedSignals = scanText(scanningCase.rawText);
    const { riskLevel, recommendation } = evaluateRisk(detectedSignals);
    const scanResult = saveScanResult(
      createScanResult({
        caseId,
        detectedSignals,
        riskLevel,
        recommendation
      })
    );

    const scannedCase = updateScanCase(caseId, (currentScanCase) =>
      markScanCaseStatus(currentScanCase, SCANCASESTATUS.SCANNED)
    );

    requestContext?.logger?.info("scan.completed", {
      caseId,
      riskLevel,
      recommendation,
      detectedSignalCount: detectedSignals.length
    });

    return {
      scanCase: toPublicScanCase(scannedCase),
      scanResult,
      cloudSafeSummary: buildSummary(scanResult, requestContext)
    };
  } catch (error) {
    updateScanCase(caseId, (currentScanCase) => ({
      ...currentScanCase,
      status: assertScanCaseTransition(currentScanCase.status, SCANCASESTATUS.FAILED),
      updatedAt: new Date().toISOString()
    }));

    requestContext?.logger?.error("scan.failed", {
      caseId,
      error: error.message
    });

    throw error;
  }
};
