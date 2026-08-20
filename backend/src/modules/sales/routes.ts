import { Router } from "express";
import salesController from "./controller.js";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.js";
import { UserRole } from "../../models/User.js";
import { validate } from "../../middlewares/validateRequest.js";
import { body } from "express-validator";

const router: Router = Router();

router.post(
  "/guest",
  validate([
    body("customer.name").notEmpty().withMessage("Name is required"),
    body("customer.email").isEmail().withMessage("Valid email is required"),
    body("customer.phone").notEmpty().withMessage("Phone is required"),
    body("customer.address").notEmpty().withMessage("Address is required"),
    body("customer.city").notEmpty().withMessage("City is required"),
    body("customer.postal_code").notEmpty().withMessage("Postal code is required"),
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.product_id").isInt({ min: 1 }).withMessage("Valid product_id is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")
  ]),
  salesController.createGuestOrder
);

router.get("/status/:orderNumber", salesController.getOrderStatus);

router.get("/my-orders", authMiddleware, salesController.getMyOrders);
router.get("/stats", authMiddleware, roleMiddleware(UserRole.ADMIN), salesController.getOrderStats);
router.get("/", authMiddleware, roleMiddleware(UserRole.ADMIN), salesController.getAllOrders);
router.get("/:id", authMiddleware, roleMiddleware(UserRole.ADMIN), salesController.getAdminOrderDetail);
router.put("/:id/status", authMiddleware, roleMiddleware(UserRole.ADMIN), salesController.updateOrderStatus);

export default router;




