import { Request, Response, NextFunction } from "express";
import authService from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { setTokenCookie } from "../../config/auth.js";
import { AuthenticatedRequest } from "../../middlewares/auth.js";
import logger from "../../utils/logger.js";

class AuthController {
  async googleLogin(_req: Request, res: Response, __next: NextFunction): Promise<void> {
    try {
      const url = await authService.handleGoogleLogin();
      res.redirect(url);
    } catch (error) {
      logger.error("Google login error", { error: (error as Error).message });
      sendError(res, "Google login failed", 500);
    }
  }

  async googleCallback(req: Request, res: Response, __next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      if (!code) {
        sendError(res, "Authorization code required", 400);
        return;
      }

      const { token } = await authService.handleGoogleCallback(code);
      setTokenCookie(res, token);

      const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error("Google callback error", { error: (error as Error).message });
      sendError(res, "Google callback failed", 500);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, __next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        sendError(res, "Not authenticated", 401);
        return;
      }
      sendSuccess(res, "User retrieved", user);
    } catch (error) {
      sendError(res, "Failed to get user", 500);
    }
  }

  async localRegister(req: Request, res: Response, __next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      const { user, token } = await authService.registerLocal(name, email, password, phone);
      setTokenCookie(res, token);
      sendSuccess(res, "Registration successful", { user, token }, 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async localLogin(req: Request, res: Response, __next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.loginLocal(email, password);
      setTokenCookie(res, token);
      sendSuccess(res, "Login successful", { user, token });
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }

  async logout(req: Request, res: Response, __next: NextFunction): Promise<void> {
    try {
      res.clearCookie("token");
      await authService.handleLogout();
      sendSuccess(res, "Logout successful");
    } catch (error) {
      sendError(res, "Logout failed", 500);
    }
  }
}

export default new AuthController();



