import { Request, Response, NextFunction } from "express";
import financeService from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

class FinanceController {
  async getAllIncomes(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { limit, offset, dateFrom, dateTo } = req.query;
      const incomes = await financeService.getAllIncomes({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      return sendSuccess(res, "Incomes retrieved", incomes);
    } catch (error) {
      return sendError(res, "Failed to get incomes", 500);
    }
  }

  async createIncome(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const income = await financeService.createIncome(req.body);
      return sendSuccess(res, "Income created", income.toJSON(), 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getAllExpenses(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { limit, offset, dateFrom, dateTo } = req.query;
      const expenses = await financeService.getAllExpenses({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
      return sendSuccess(res, "Expenses retrieved", expenses);
    } catch (error) {
      return sendError(res, "Failed to get expenses", 500);
    }
  }

  async createExpense(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const expense = await financeService.createExpense(req.body);
      return sendSuccess(res, "Expense created", expense.toJSON(), 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getFinanceSummary(_req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const summary = await financeService.getFinanceSummary();
      return sendSuccess(res, "Finance summary retrieved", summary);
    } catch (error) {
      return sendError(res, "Failed to get finance summary", 500);
    }
  }
}

export default new FinanceController();







