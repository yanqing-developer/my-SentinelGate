import { createHttpError } from "../utils/http-error.js";

export const notFoundMiddleware = (req, res, next) => {
  next(createHttpError(404, "NOT_FOUND", "Route not found."));
};
