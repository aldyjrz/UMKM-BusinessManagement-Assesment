import { Router } from "express";
import inventoryController from "./controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth";
import { UserRole } from "../../models/User";
import { validate } from "../../middlewares/validateRequest";
import { body } from "express-validator";

const router: Router = Router();

router.get("/", inventoryController.getAllProducts);
router.get("/stock-movements", authMiddleware, roleMiddleware(UserRole.ADMIN), inventoryController.getAllStockMovements);
router.get("/categories", inventoryController.getCategories);
router.get("/suppliers", inventoryController.getSuppliers);
router.get("/summary", authMiddleware, roleMiddleware(UserRole.ADMIN), inventoryController.getInventorySummary);
router.get("/:id", inventoryController.getProductById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate([
    body("sku").notEmpty().withMessage("SKU is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("cost").isFloat({ min: 0 }).withMessage("Valid cost is required"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be non-negative"),
    body("minimum_stock").isInt({ min: 0 }).withMessage("Minimum stock is required"),
    body("status").isIn(["ACTIVE", "INACTIVE"]).withMessage("Valid status is required")
  ]),
  inventoryController.createProduct
);

router.put("/:id", authMiddleware, roleMiddleware(UserRole.ADMIN), inventoryController.updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware(UserRole.ADMIN), inventoryController.deleteProduct);
router.post("/adjustment", authMiddleware, roleMiddleware(UserRole.ADMIN), inventoryController.createStockAdjustment);
router.post("/purchase", authMiddleware, roleMiddleware(UserRole.STAFF), inventoryController.createPurchase);

export default router;




