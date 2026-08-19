import { Router } from "express";
import paymentController from "./controller";

const router: Router = Router();

router.post("/webhook", paymentController.webhook);
router.post("/", paymentController.createPayment);
router.get("/:id", paymentController.getPaymentById);
router.get("/order/:orderId", paymentController.getPaymentByOrderId);
router.get("/order/:orderId/status", paymentController.checkPaymentByOrderId);
export default router;




