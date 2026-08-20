import { Request, Response, NextFunction } from "express";
import paymentService from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import logger from "../../utils/logger.js";

class PaymentController {
  async webhook(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const payload = req.body;
      const signatureKey = req.headers["x-signature-key"] as string | undefined;

      logger.info("Payment webhook received", { orderId: payload?.order_id });

      const result = await paymentService.handleWebhook(payload, signatureKey);

      if (result.success) {
        return sendSuccess(res, result.message, {});
      } else {
        return sendError(res, result.message, 400);
      }
    } catch (error) {
      logger.error("Webhook error", { error: (error as Error).message });
      return sendError(res, "Webhook processing failed", 500);
    }
  }

  async createPayment(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { orderId } = req.body;
      const payment = await paymentService.createPayment(orderId);
      return sendSuccess(res, "Payment created", payment, 201);
    } catch (error) {
      return sendError(res, (error as Error).message || "Failed to create payment", 400);
    }
  }

  async getPaymentById(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(parseInt(id));

      if (!payment) {
        return sendError(res, "Payment not found", 404);
      }

      return sendSuccess(res, "Payment retrieved", payment);
    } catch (error) {
      return sendError(res, "Failed to get payment", 500);
    }
  }

  async getPaymentByOrderId(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.getPaymentByOrderId(parseInt(orderId));

      if (!payment) {
        return sendError(res, "Payment not found", 404);
      }

      return sendSuccess(res, "Payment retrieved", payment);
    } catch (error) {
      return sendError(res, "Failed to get payment", 500);
    }
  }
  async checkPaymentByOrderId(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.checkAndUpdatePaymentStatus(orderId);

      if (!payment) {
        return sendError(res, "Payment not found", 404);
      }

      return sendSuccess(res, "Payment retrieved", payment);
    } catch (error) {
      return sendError(res, "Failed to get payment", 500);
    }
  }

  async confirmPayment(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { orderNumber } = req.params;
      const order = await paymentService.checkAndUpdatePaymentStatus(orderNumber);

      if (!order) {
        return sendError(res, "Order not found", 404);
      }

      return sendSuccess(res, "Payment confirmed", {
        order_number: order.order_number,
        payment_status: order.payment_status,
        status: order.status
      });
    } catch (error) {
      logger.error("Confirm payment error", { error: (error as Error).message });
      return sendError(res, "Failed to confirm payment", 500);
    }
  }
}

export default new PaymentController();






