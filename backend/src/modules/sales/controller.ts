import { Request, Response, NextFunction } from "express";
import salesService from "./service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import logger from "../../utils/logger.js";
import OrderItem from "../../models/OrderItem.js";
import Payment from "../../models/Payment.js";
import Order from "../../models/Order.js";
import Customer from "../../models/Customer.js";

class SalesController {
  async createGuestOrder(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const input = req.body;
      const { order, payment } = await salesService.createGuestOrder(input);

      const orderJson = order.toJSON() as any;
      const paymentJson = payment.toJSON() as any;

      return sendSuccess(res, "Order created successfully", {
        order: orderJson,
        payment: {
          id: paymentJson.id,
          order_id: paymentJson.order_id,
          payment_method: paymentJson.payment_method,
          amount: paymentJson.amount,
          status: paymentJson.status,
          snap_token: paymentJson.snap_token,
          redirect_url: paymentJson.redirect_url
        }
      }, 201);
    } catch (error) {
      logger.error("Create guest order error", { error: (error as Error).message });
      return sendError(res, (error as Error).message || "Failed to create order", 400);
    }
  }

  async getOrderById(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const order = await salesService.getOrderById(parseInt(id));

      if (!order) {
        return sendError(res, "Order not found", 404);
      }

      const orderJson = order.toJSON() as any;
      return sendSuccess(res, "Order retrieved", orderJson);
    } catch (error) {
      return sendError(res, "Failed to get order", 500);
    }
  }

  async getOrderStatus(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { orderNumber } = req.params;
      const { token } = req.query;

      if (!token) {
        return sendError(res, "Access token required", 401);
      }

      const order = await salesService.getOrderStatus(orderNumber, token as string);

      if (!order) {
        return sendError(res, "Order not found or access denied", 404);
      }

      return sendSuccess(res, "Order status retrieved", order.toJSON());
    } catch (error) {
      return sendError(res, "Failed to get order status", 500);
    }
  }

  async getMyOrders(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
          console.log("MY ORDERS userId:", userId);

      if (!userId) {
        return sendError(res, "Authentication required", 401);
      }

      const customer = await Customer.findOne({ where: { user_id: userId } });
      if (!customer) {
        return sendSuccess(res, "No orders found", []);
      }
      console.log("customer found");

      const orders = await Order.findAll({
        where: { customer_id: customer.id },
        include: [{ model: OrderItem, as: "items" }, { model: Payment, as: "payment" }],
        order: [["created_at", "DESC"]]
      });

      return sendSuccess(res, "Orders retrieved", orders);
    } catch (error) {
       logger.error("Failed to get orders " + (error as Error).message, {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

  return sendError(
    res,
    (error as Error).message || "Failed to get orders",
    500
  );
     }
  }

  async getAllOrders(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { status, limit = "50", offset = "0" } = req.query;
      const orders = await salesService.getAllOrders({
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      return sendSuccess(res, "Orders retrieved", orders);
    } catch (error) {
      return sendError(res, "Failed to get orders", 500);
    }
  }

  async getOrderStats(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const stats = await salesService.getOrderTotalStats();
      return sendSuccess(res, "Order stats retrieved", stats);
    } catch (error) {
      return sendError(res, "Failed to get order stats", 500);
    }
  }

  async updateOrderStatus(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.body;
      const order = await salesService.updateOrderStatus(parseInt(id), { status, payment_status });
      if (!order) {
        return sendError(res, "Order not found", 404);
      }
      return sendSuccess(res, "Order updated", order.toJSON());
    } catch (error) {
      return sendError(res, (error as Error).message || "Failed to update order", 400);
    }
  }

  async getAdminOrderDetail(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const order = await salesService.getOrderById(parseInt(id));
      if (!order) {
        return sendError(res, "Order not found", 404);
      }
      const payment = await salesService.getPaymentForOrder(order.id);
      const orderJson = order.toJSON() as any;
      orderJson.payment = payment ? payment.toJSON() : null;
      return sendSuccess(res, "Order retrieved", orderJson);
    } catch (error) {
      return sendError(res, "Failed to get order", 500);
    }
  }
}

export default new SalesController();






