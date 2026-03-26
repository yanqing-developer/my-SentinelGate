import { randomUUID } from "node:crypto";

const SERVICE_NAME = "sentinelgate-cloud-platform";

const writeLog = (level, message, data = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    message,
    ...data
  };

  console.log(JSON.stringify(entry));
};

export const logger = {
  info(message, data) {
    writeLog("INFO", message, data);
  },
  warn(message, data) {
    writeLog("WARN", message, data);
  },
  error(message, data) {
    writeLog("ERROR", message, data);
  }
};

export const createRequestLogger = (requestId) => ({
  info(message, data) {
    logger.info(message, { requestId, ...data });
  },
  warn(message, data) {
    logger.warn(message, { requestId, ...data });
  },
  error(message, data) {
    logger.error(message, { requestId, ...data });
  }
});

export const createRequestId = () => randomUUID();
