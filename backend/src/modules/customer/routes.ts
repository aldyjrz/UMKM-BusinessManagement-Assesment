import { Router } from "express";
import customerController from "./controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../models/User";
import { validate } from "../../middlewares/validateRequest";
import { body } from "express-validator";

const router: Router = Router();

router.get("/", authMiddleware, roleMiddleware(UserRole.ADMIN), customerController.getAllCustomers);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("postal_code").notEmpty().withMessage("Postal code is required")
  ]),
  customerController.createCustomer
);
router.get("/:id", authMiddleware, roleMiddleware(UserRole.ADMIN), customerController.getCustomerById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate([
    body("name").optional().notEmpty().withMessage("Name is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone").optional().notEmpty().withMessage("Phone is required"),
    body("address").optional().notEmpty().withMessage("Address is required"),
    body("city").optional().notEmpty().withMessage("City is required"),
    body("postal_code").optional().notEmpty().withMessage("Postal code is required")
  ]),
  customerController.updateCustomer
);
router.delete("/:id", authMiddleware, roleMiddleware(UserRole.ADMIN), customerController.deleteCustomer);

export default router;




