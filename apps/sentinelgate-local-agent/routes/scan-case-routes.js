import { Router } from "express";
import {
  createScanCaseController,
  getScanCaseController,
  getScanResultController,
  scanCaseController
} from "../controllers/scan-case-controllers.js";

const scanCaseRouter = Router();

scanCaseRouter.post("/scan-cases", createScanCaseController);
scanCaseRouter.post("/scan-cases/:id/scan", scanCaseController);
scanCaseRouter.get("/scan-cases/:id", getScanCaseController);
scanCaseRouter.get("/scan-cases/:id/result", getScanResultController);

export default scanCaseRouter;
