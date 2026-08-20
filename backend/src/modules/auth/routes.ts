import { Router } from "express";
import authController from "./controller.js";
import { authMiddleware } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateRequest.js";
import { body } from "express-validator";

const router: Router = Router();

router.get("/me", authMiddleware, authController.me);

router.post("/register", validate([
  body("name").notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone").notEmpty().withMessage("Phone is required")
]), authController.localRegister);

router.post("/login", validate([
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
]), authController.localLogin);

router.post("/logout", authController.logout);

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

export default router;




