import { Router } from "express";
import { healthCheck } from "./health.js";
import {
  createScanSummaryController,
  getScanSummaryController,
  listScanSummariesByCaseIdController,
  listScanSummariesController
} from "../controllers/scan-summary-controllers.js";

const router = Router();

router.get("/health", healthCheck);
router.post("/api/scan-summaries", createScanSummaryController);
router.get("/api/scan-summaries", listScanSummariesController);
router.get("/api/scan-summaries/case/:caseId", listScanSummariesByCaseIdController);
router.get("/api/scan-summaries/:id", getScanSummaryController);

export default router;
