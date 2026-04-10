import app from "./app.js";
import { initializeScanSummaryStore, getScanSummaryStorePath } from "./store/scan-summary-store.js";
import { logger } from "./utils/logger.js";

initializeScanSummaryStore();
logger.info("storage.initialized", {
  storage: "sqlite",
  dbPath: getScanSummaryStorePath()
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`sentinelgate-cloud-platform listening on ${port}`);
});
