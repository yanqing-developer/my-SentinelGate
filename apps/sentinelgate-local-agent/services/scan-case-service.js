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

export const createLocalScanCase = ({ rawText, sourceType = "text", immediateScan = false }) => {
  const scanCase = saveScanCase(createScanCase({ rawText, sourceType }));

  if (!immediateScan) {
    return {
      scanCase: toPublicScanCase(scanCase),
      scanResult: null,
      cloudSafeSummary: null
    };
  }

  return scanExistingCase(scanCase.id);
};

export const getLocalScanCase = (caseId) => {
  const scanCase = getScanCaseById(caseId);

  if (!scanCase) {
    throw createHttpError("Scan case not found.", 404);
  }

  return toPublicScanCase(scanCase);
};

export const getLocalScanResult = (caseId) => {
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
    cloudSafeSummary: toCloudSafeSummary(scanResult)
  };
};

export const scanExistingCase = (caseId) => {
  const scanCase = getScanCaseById(caseId);

  if (!scanCase) {
    throw createHttpError("Scan case not found.", 404);
  }

  if (scanCase.status !== SCANCASESTATUS.DRAFT) {
    throw createHttpError("Scan case can only be scanned from DRAFT state.", 400);
  }

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

    return {
      scanCase: toPublicScanCase(scannedCase),
      scanResult,
      cloudSafeSummary: toCloudSafeSummary(scanResult)
    };
  } catch (error) {
    updateScanCase(caseId, (currentScanCase) => ({
      ...currentScanCase,
      status: assertScanCaseTransition(currentScanCase.status, SCANCASESTATUS.FAILED),
      updatedAt: new Date().toISOString()
    }));

    throw error;
  }
};
