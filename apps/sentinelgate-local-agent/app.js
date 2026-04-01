import express from "express";
import scanCaseRouter from "./routes/scan-case-routes.js";
import jobRouter from "./routes/job-routes.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { notFoundMiddleware } from "./middleware/not-found.js";
import { errorHandlerMiddleware } from "./middleware/error-handler.js";

const app = express();

app.use(express.json());
app.use(requestContextMiddleware);
app.use("/api", scanCaseRouter);
app.use("/api", jobRouter);

app.get("/api/health", (req, res) => {
  req.logger.info("health.checked");

  return res.status(200).json({
    ok: true,
    service: "sentinelgate-local-agent"
  });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
