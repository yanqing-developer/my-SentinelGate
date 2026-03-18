import { createJobController,
         getJobByIdController,
         startJobController,
         completeJobController,
         failJobController } from "../controllers/job-controllers.js"
import { Router } from "express";


const jobRouter=Router();

jobRouter.post("/jobs",createJobController);
jobRouter.get("/jobs/:id",getJobByIdController);
jobRouter.post("/jobs/:id/start",startJobController);
jobRouter.post("/jobs/:id/complete",completeJobController);
jobRouter.post("/jobs/:id/fail",failJobController);




export default jobRouter;