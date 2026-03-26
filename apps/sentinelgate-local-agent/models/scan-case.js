import { v4 as uuidv4 } from "uuid";
import { SCANCASESTATUS } from "../utils/scan-case-status.js";

export const createScanCase = ({ rawText, sourceType = "text" }) => {
  if (typeof rawText !== "string" || rawText.trim() === "") {
    throw new Error("rawText is required");
  }

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    status: SCANCASESTATUS.DRAFT,
    sourceType,
    rawText,
    createdAt: now,
    updatedAt: now
  };
};

export const toPublicScanCase = (scanCase) => ({
  id: scanCase.id,
  status: scanCase.status,
  sourceType: scanCase.sourceType,
  createdAt: scanCase.createdAt,
  updatedAt: scanCase.updatedAt
});
