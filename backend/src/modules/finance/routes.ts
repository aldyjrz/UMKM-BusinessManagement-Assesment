import { Router } from "express";
import financeController from "./controller.js";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.js";
import { UserRole } from "../../models/User.js";
import { validate } from "../../middlewares/validateRequest.js";
import { body } from "express-validator";

const router: Router = Router();

router.get("/summary", authMiddleware, roleMiddleware(UserRole.ADMIN), financeController.getFinanceSummary);
router.get("/incomes", authMiddleware, roleMiddleware(UserRole.ADMIN), financeController.getAllIncomes);
router.post(
  "/incomes",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate([body("order_id").isInt(), body("amount").isFloat({ min: 0 })]),
  financeController.createIncome
);
router.get("/expenses", authMiddleware, roleMiddleware(UserRole.ADMIN), financeController.getAllExpenses);
router.post(
  "/expenses",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate([body("category").notEmpty(), body("amount").isFloat({ min: 0 })]),
  financeController.createExpense
);

export default router;




