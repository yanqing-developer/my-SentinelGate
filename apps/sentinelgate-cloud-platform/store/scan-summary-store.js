import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createHttpError } from "../utils/http-error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.resolve(__dirname, "../data/scan-summaries.sqlite");

let database = null;
let databasePath = null;

const ensureDatabase = () => {
  if (!database) {
    initializeScanSummaryStore();
  }

  return database;
};

const mapRowToRecord = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    caseId: row.case_id,
    detectedSignals: JSON.parse(row.detected_signals_json),
    riskLevel: row.risk_level,
    recommendation: row.recommendation,
    source: row.source,
    receivedAt: row.received_at
  };
};

export const initializeScanSummaryStore = (filePath = process.env.SENTINELGATE_CLOUD_DB_PATH || DEFAULT_DB_PATH) => {
  if (database && databasePath === filePath) {
    return database;
  }

  if (database) {
    database.close();
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  database = new DatabaseSync(filePath);
  databasePath = filePath;

  database.exec(`
    CREATE TABLE IF NOT EXISTS scan_summary_records (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      detected_signals_json TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      source TEXT NOT NULL,
      received_at TEXT NOT NULL
    );
  `);

  return database;
};

export const getScanSummaryStorePath = () => databasePath ?? process.env.SENTINELGATE_CLOUD_DB_PATH ?? DEFAULT_DB_PATH;

export const saveScanSummaryRecord = (record) => {
  const db = ensureDatabase();
  const statement = db.prepare(`
    INSERT INTO scan_summary_records (
      id,
      case_id,
      detected_signals_json,
      risk_level,
      recommendation,
      source,
      received_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    statement.run(
      record.id,
      record.caseId,
      JSON.stringify(record.detectedSignals),
      record.riskLevel,
      record.recommendation,
      record.source,
      record.receivedAt
    );
  } catch (error) {
    throw createHttpError(500, "STORAGE_ERROR", "Failed to persist scan summary record.");
  }

  return record;
};

export const getScanSummaryRecordById = (recordId) => {
  const db = ensureDatabase();
  const statement = db.prepare(`
    SELECT id, case_id, detected_signals_json, risk_level, recommendation, source, received_at
    FROM scan_summary_records
    WHERE id = ?
  `);

  return mapRowToRecord(statement.get(recordId) ?? null);
};

export const listScanSummaryRecords = () => {
  const db = ensureDatabase();
  const statement = db.prepare(`
    SELECT id, case_id, detected_signals_json, risk_level, recommendation, source, received_at
    FROM scan_summary_records
    ORDER BY received_at ASC
  `);

  return statement.all().map(mapRowToRecord);
};

export const listScanSummaryRecordsByCaseId = (caseId) => {
  const db = ensureDatabase();
  const statement = db.prepare(`
    SELECT id, case_id, detected_signals_json, risk_level, recommendation, source, received_at
    FROM scan_summary_records
    WHERE case_id = ?
    ORDER BY received_at ASC
  `);

  return statement.all(caseId).map(mapRowToRecord);
};

export const resetScanSummaryStore = () => {
  const db = ensureDatabase();
  db.exec("DELETE FROM scan_summary_records");
};

export const closeScanSummaryStore = () => {
  if (database) {
    database.close();
    database = null;
    databasePath = null;
  }
};
