export const SCANCASESTATUS = {
  DRAFT: "DRAFT",
  SCANNING: "SCANNING",
  SCANNED: "SCANNED",
  FAILED: "FAILED"
};

const ALLOWED_TRANSITIONS = {
  DRAFT: ["SCANNING"],
  SCANNING: ["SCANNED", "FAILED"],
  SCANNED: [],
  FAILED: []
};

export const assertValidScanCaseStatus = (status) => {
  if (!Object.values(SCANCASESTATUS).includes(status)) {
    throw new Error(`Invalid scan case status: ${status}`);
  }

  return status;
};

export const assertScanCaseTransition = (fromStatus, toStatus) => {
  assertValidScanCaseStatus(fromStatus);
  assertValidScanCaseStatus(toStatus);

  if (!ALLOWED_TRANSITIONS[fromStatus].includes(toStatus)) {
    throw new Error(`Invalid scan case transition: ${fromStatus} -> ${toStatus}`);
  }

  return toStatus;
};
