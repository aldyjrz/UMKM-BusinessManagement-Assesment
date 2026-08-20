import { Router } from "express";
import dashboardController from "./controller.js";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.js";
import { UserRole } from "../../models/User.js";

const router: Router = Router();

router.get("/", authMiddleware, roleMiddleware(UserRole.ADMIN), dashboardController.getDashboardData);

export default router;




