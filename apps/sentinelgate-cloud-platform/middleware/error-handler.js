import { captureError } from "../utils/monitoring.js";

export const errorHandlerMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode ?? 500;
  const code = error.code ?? (statusCode === 404 ? "NOT_FOUND" : "INTERNAL_ERROR");
  const message = statusCode === 500 ? "Cloud summary request failed." : error.message;

  req.logger.error("request.error", {
    statusCode,
    code,
    error: error.message,
    path: req.originalUrl,
    method: req.method
  });

  captureError(error, {
    logger: req.logger,
    requestId: req.requestId,
    statusCode,
    code,
    path: req.originalUrl,
    method: req.method
  });

  res.status(statusCode).json({
    error: {
      code,
      message,
      requestId: req.requestId
    }
  });
};
