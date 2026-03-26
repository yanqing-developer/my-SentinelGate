const scanCaseStore = new Map();
const scanResultStore = new Map();

export const saveScanCase = (scanCase) => {
  scanCaseStore.set(scanCase.id, scanCase);
  return scanCase;
};

export const getScanCaseById = (caseId) => scanCaseStore.get(caseId) ?? null;

export const updateScanCase = (caseId, updateFn) => {
  const currentScanCase = getScanCaseById(caseId);

  if (!currentScanCase) {
    return null;
  }

  const nextScanCase = updateFn(currentScanCase);
  scanCaseStore.set(caseId, nextScanCase);
  return nextScanCase;
};

export const saveScanResult = (scanResult) => {
  scanResultStore.set(scanResult.caseId, scanResult);
  return scanResult;
};

export const getScanResultByCaseId = (caseId) => scanResultStore.get(caseId) ?? null;

export const resetScanDomainStore = () => {
  scanCaseStore.clear();
  scanResultStore.clear();
};
