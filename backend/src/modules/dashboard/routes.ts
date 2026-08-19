import { Router } from "express";
import dashboardController from "./controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../models/User";

const router: Router = Router();

router.get("/", authMiddleware, roleMiddleware(UserRole.ADMIN), dashboardController.getDashboardData);

export default router;




