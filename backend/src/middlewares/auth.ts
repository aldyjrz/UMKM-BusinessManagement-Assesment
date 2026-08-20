import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";
import User, { UserRole } from "../models/User.js";

interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    name: string;
  };
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const secret = process.env.JWT_SECRET || "change-this-in-production";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded) {
      sendError(res, "Invalid token", 401);
      return;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      sendError(res, "User not found or inactive", 401);
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    logger.error("Auth middleware error", { error: (error as Error).message });
    sendError(res, "Authentication failed", 401);
  }
}

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }

    next();
  };
}
 
