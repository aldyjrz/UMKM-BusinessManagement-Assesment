import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export default function errorHandler(err: Error | any, req: Request, res: Response, _next: NextFunction): Response {
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === "SequelizeValidationError") {
    const errors: Record<string, unknown> = {};
    err.errors.forEach((e: any) => {
      errors[e.path] = e.message;
    });
    return sendError(res, "Validation failed", 400, errors);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const errors: Record<string, unknown> = {};
    err.errors.forEach((e: any) => {
      errors[e.path] = e.message;
    });
    return sendError(res, "Duplicate entry", 409, errors);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return sendError(res, "Unauthorized", 401);
  }

  if (process.env.NODE_ENV === "production") {
    return sendError(res, "Internal server error", 500);
  }

  return sendError(res, err.message || "Internal server error", err.statusCode || 500);
}


