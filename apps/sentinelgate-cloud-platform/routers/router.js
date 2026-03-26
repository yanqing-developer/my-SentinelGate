import { Router } from "express";
import { healthCheck } from "./health.js";

const router = Router();
const forbiddenRawFields = ["rawText", "rawContent", "content", "text"];

router.get("/health", healthCheck);

router.post("/api/scan-summaries", (req, res) => {
  const payload = req.body ?? {};
  const hasRawField = forbiddenRawFields.some((field) => field in payload);

  if (hasRawField) {
    return res.status(400).json({
      error: "Raw text fields are not allowed in cloud-bound summary payloads."
    });
  }

  const { caseId, detectedSignals, riskLevel } = payload;

  if (
    typeof caseId !== "string" ||
    !Array.isArray(detectedSignals) ||
    typeof riskLevel !== "string"
  ) {
    return res.status(400).json({
      error: "caseId, detectedSignals, and riskLevel are required summary fields."
    });
  }

  return res.status(202).json({
    accepted: true,
    service: "sentinelgate-cloud-platform",
    summary: {
      caseId,
      detectedSignals,
      riskLevel
    }
  });
});

export default router;
