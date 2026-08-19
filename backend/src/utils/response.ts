import { Response } from "express";
import { randomBytes } from "crypto";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
}

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data: data || {} as T
  };
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode: number = 500, errors?: Record<string, unknown>): Response {
  const response: ApiResponse = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

export function asyncHandler(fn: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>) {
  return (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const day = String(new Date().getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}${month}${day}-${random}`;
}

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}
