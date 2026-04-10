import { createRequestId, createRequestLogger } from "../utils/logger.js";

export const requestContextMiddleware = (req, res, next) => {
  const requestId = req.header("x-correlation-id") || req.header("x-request-id") || createRequestId();

  req.requestId = requestId;
  req.logger = createRequestLogger(requestId);

  res.setHeader("x-request-id", requestId);
  res.setHeader("x-correlation-id", requestId);

  req.logger.info("request.started", {
    method: req.method,
    path: req.originalUrl
  });

  res.on("finish", () => {
    req.logger.info("request.completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode
    });
  });

  next();
};
