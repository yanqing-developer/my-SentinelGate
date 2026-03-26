import { v4 as uuidv4 } from "uuid";
import { JOBSTATUS } from "../utils/job-status.js";

export const createScanJob = (input) => {
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("Input is required");
  }

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    input,
    status: JOBSTATUS.PENDING,
    createdAt: now,
    updatedAt: now
  };
};
