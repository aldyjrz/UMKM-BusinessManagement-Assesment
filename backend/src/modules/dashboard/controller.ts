import { Request, Response, NextFunction } from "express";
import dashboardService from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

class DashboardController {
  async getDashboardData(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const data = await dashboardService.getDashboardData();
      return sendSuccess(res, "Dashboard data retrieved", data);
    } catch (error) {
      return sendError(res, "Failed to get dashboard data", 500);
    }
  }
}

export default new DashboardController();






