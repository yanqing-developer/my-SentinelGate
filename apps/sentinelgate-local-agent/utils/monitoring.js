export const captureError = (error, context = {}) => {
  context.logger?.error("monitoring.capture_error", {
    requestId: context.requestId,
    statusCode: context.statusCode,
    code: context.code,
    path: context.path,
    method: context.method,
    error: error.message
  });
};
