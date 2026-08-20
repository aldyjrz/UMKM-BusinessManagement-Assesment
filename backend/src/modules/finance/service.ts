import Income from "../../models/Income.js";
import Expense from "../../models/Expense.js";
import Order from "../../models/Order.js";
import { sequelize } from "../../models/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";

export interface IncomeInput {
  order_id: number;
  amount: number;
  description?: string;
  source?: string;
}

export interface ExpenseInput {
  category: string;
  amount: number;
  description?: string;
  expense_date?: Date;
}

export async function getAllIncomes(filters?: { limit?: number; offset?: number; dateFrom?: string; dateTo?: string }): Promise<Income[]> {
  const where: any = {};
  if (filters?.dateFrom) {
    where.created_at = { [Op.gte]: new Date(filters.dateFrom) };
  }
  if (filters?.dateTo) {
    where.created_at = { ...where.created_at, [Op.lte]: new Date(filters.dateTo) };
  }

  return Income.findAll({
    where,
    limit: filters?.limit,
    offset: filters?.offset,
    include: [{ model: Order, as: "order", attributes: ["order_number"] }],
    order: [["created_at", "DESC"]]
  });
}

export async function createIncome(input: IncomeInput): Promise<Income> {
  const income = await Income.create({
    order_id: input.order_id,
    amount: input.amount,
    description: input.description,
    source: input.source || "MANUAL"
  });
  logger.info("Income created", { incomeId: income.id, amount: input.amount });
  return income;
}

export async function getAllExpenses(filters?: { limit?: number; offset?: number; dateFrom?: string; dateTo?: string }): Promise<Expense[]> {
  const where: any = {};
  if (filters?.dateFrom) {
    where.expense_date = { [Op.gte]: new Date(filters.dateFrom) };
  }
  if (filters?.dateTo) {
    where.expense_date = { ...where.expense_date, [Op.lte]: new Date(filters.dateTo) };
  }

  return Expense.findAll({ where, limit: filters?.limit, offset: filters?.offset, order: [["created_at", "DESC"]] });
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const expense = await Expense.create({
    category: input.category,
    amount: input.amount,
    description: input.description,
    expense_date: input.expense_date || new Date()
  });
  logger.info("Expense created", { expenseId: expense.id, category: input.category, amount: input.amount });
  return expense;
}
export async function getFinanceSummary(): Promise<{
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  todayRevenue: number;
  todayExpense: number;
  monthlyRevenue: number;
  monthlyExpense: number;
}> {
  const today = new Date();

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfTomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  );

  const [
    totalRevenue,
    totalExpense,
    todayRevenue,
    todayExpense,
    monthlyRevenue,
    monthlyExpense
  ] = await Promise.all([
    Income.sum("amount"),

    Expense.sum("amount"),

    Income.sum("amount", {
      where: {
        created_at: {
          [Op.gte]: startOfDay,
          [Op.lt]: startOfTomorrow
        }
      }
    }),

    Expense.sum("amount", {
      where: {
        expense_date: {
          [Op.gte]: startOfDay,
          [Op.lt]: startOfTomorrow
        }
      }
    }),

    Income.sum("amount", {
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth
        }
      }
    }),

    Expense.sum("amount", {
      where: {
        expense_date: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth
        }
      }
    })
  ]);

  return {
    totalRevenue: Number(totalRevenue || 0),
    totalExpense: Number(totalExpense || 0),
    netProfit:
      Number(totalRevenue || 0) -
      Number(totalExpense || 0),

    todayRevenue: Number(todayRevenue || 0),
    todayExpense: Number(todayExpense || 0),

    monthlyRevenue: Number(monthlyRevenue || 0),
    monthlyExpense: Number(monthlyExpense || 0)
  };
}

const financeService = {
  getAllIncomes,
  createIncome,
  getAllExpenses,
  createExpense,
  getFinanceSummary
};

export default financeService;




