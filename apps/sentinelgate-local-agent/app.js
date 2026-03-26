import express from "express";
import scanCaseRouter from "./routes/scan-case-routes.js";
import jobRouter from "./routes/job-routes.js";

const app = express();

app.use(express.json());
app.use("/api", scanCaseRouter);
app.use("/api", jobRouter);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    service: "sentinelgate-local-agent"
  });
});

export default app;
