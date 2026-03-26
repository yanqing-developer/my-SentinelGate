const summaryRecordStore = new Map();

export const saveScanSummaryRecord = (record) => {
  summaryRecordStore.set(record.id, record);
  return record;
};

export const getScanSummaryRecordById = (recordId) => summaryRecordStore.get(recordId) ?? null;

export const listScanSummaryRecords = () => Array.from(summaryRecordStore.values());

export const listScanSummaryRecordsByCaseId = (caseId) =>
  listScanSummaryRecords().filter((record) => record.caseId === caseId);

export const resetScanSummaryStore = () => {
  summaryRecordStore.clear();
};
