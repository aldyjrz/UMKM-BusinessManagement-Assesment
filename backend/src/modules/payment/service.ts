import Payment from "../../models/Payment";
import Order, { OrderStatus } from "../../models/Order";
import OrderItem from "../../models/OrderItem";
import Product from "../../models/Product";
import StockMovement, { MovementType } from "../../models/StockMovement";
import Income from "../../models/Income";
import { sequelize } from "../../models";
import Customer from "../../models/Customer";
import midtransService from "../../integrations/payment/midtrans";
import n8nService from "../../integrations/n8n/n8nClient";
import logger from "../../utils/logger";

export async function handleWebhook(payload: any, signatureKey?: string): Promise<{ success: boolean; message: string }> {
  if (!payload || !payload.order_id || !payload.transaction_status) {
    logger.warn("Invalid webhook payload received");
    return { success: false, message: "Invalid payload" };
  }

  const orderId = payload.order_id;
  const gatewayStatus = payload.transaction_status;
  const fraudStatus = payload.fraud_status;
  const sigKey = signatureKey || payload.signature_key;
  const statusCode = payload.status_code;
  const grossAmount = payload.gross_amount;

  try {
    if (sigKey) {
      const isValid = await midtransService.verifySignatureKey(
        orderId,
        statusCode,
        grossAmount,
        sigKey
      );
      if (!isValid) {
        logger.warn("Invalid webhook signature", { orderId });
        return { success: false, message: "Invalid signature" };
      }
    }

    const order = await Order.findOne({ where: { order_number: orderId } });
    if (!order) {
      logger.warn("Order not found in webhook", { orderId });
      return { success: false, message: "Order not found" };
    }

    const existingPayment = await Payment.findOne({ where: { order_id: order.id } });
    if (existingPayment && existingPayment.status === "PAID") {
      logger.info("Payment already processed, skipping", { orderId });
      return { success: true, message: "Already processed" };
    }

    const mappedStatus = midtransService.getStatusMapping(gatewayStatus, fraudStatus);
    logger.info("Webhook payment status mapped", { orderId, gatewayStatus, mappedStatus });

    if (mappedStatus !== "PAID") {
      if (existingPayment) {
        await existingPayment.update({ status: mappedStatus });
      }
      await order.update({ payment_status: mappedStatus });
      return { success: true, message: `Payment status updated to ${mappedStatus}` };
    }

    await processSuccessfulPayment(order, existingPayment, payload);

    return { success: true, message: "Payment processed successfully" };
  } catch (error) {
    logger.error("Webhook processing error", { orderId, error: (error as Error).message });
    return { success: false, message: "Processing failed" };
  }
}

async function processSuccessfulPayment(
  order: Order,
  payment: Payment | null,
  payload: any
): Promise<void> {
  const t = await sequelize.transaction();

  try {
    if (payment) {
      await payment.update(
        {
          status: "PAID",
          gateway_transaction_id: payload.transaction_id || payment.gateway_transaction_id,
          gateway_response: JSON.stringify(payload),
          updated_at: new Date()
        },
        { transaction: t }
      );
    } else {
      await Payment.create(
        {
          order_id: order.id,
          payment_method: payload.payment_method || "BANK_TRANSFER",
          amount: parseFloat(order.total_amount.toString()),
          status: "PAID",
          payment_gateway: "MIDTRANS",
          gateway_transaction_id: payload.transaction_id,
          gateway_response: JSON.stringify(payload)
        },
        { transaction: t }
      );
    }

    await order.update(
      {
        status: OrderStatus.PAID,
        payment_status: "PAID",
        updated_at: new Date()
      },
      { transaction: t }
    );

    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      transaction: t
    });

    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      const currentStock = product.stock;
      const newStock = currentStock - item.quantity;
      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${item.quantity}`);
      }

      await product.update({ stock: newStock }, { transaction: t });

      await StockMovement.create(
        {
          product_id: product.id,
          type: MovementType.SALE,
          quantity: item.quantity,
          stock_before: currentStock,
          stock_after: newStock,
          reference_id: order.order_number,
          reference_type: "ORDER",
          notes: `Sale from order ${order.order_number}`
        },
        { transaction: t }
      );

      if (newStock <= product.minimum_stock) {
        await t.afterCommit(() => {
          n8nService.triggerLowStockNotification({
            productId: product.id,
            productName: product.name,
            currentStock: newStock,
            minimumStock: product.minimum_stock
          });
        });
      }
    }

    await Income.create(
      {
        order_id: order.id,
        amount: parseFloat(order.total_amount.toString()),
        description: `Income from order ${order.order_number}`,
        source: "PAYMENT"
      },
      { transaction: t }
    );

    await t.commit();

    logger.info("Payment processed successfully", { orderId: order.order_number, amount: order.total_amount });

    const customer = order.customer_id ? await Customer.findByPk(order.customer_id) : null;
    await n8nService.triggerPaymentNotification({
      orderId: order.id,
      orderNumber: order.order_number,
      amount: parseFloat(order.total_amount.toString()),
      customerEmail: order.customer_email
    });

    if (customer && customer.type === "REGISTERED") {
      n8nService.triggerWebhook("welcome-back", {
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: customer.email
      });
    }
  } catch (error) {
    await t.rollback();
    logger.error("Failed to process payment", { orderId: order.order_number, error: (error as Error).message });
    throw error;
  }
}
export async function createPayment(orderId: number): Promise<Payment> {
  const order = await Order.findByPk(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.payment_status === "PAID") {
    throw new Error("Order already paid");
  }

  const items = await OrderItem.findAll({
    where: { order_id: order.id }
  });

  const itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }> = items.map((item) => ({
    id: item.product_sku,
    price: Math.round(parseFloat(item.unit_price.toString())),
    quantity: item.quantity,
    name: item.product_name
  }));

  const subtotal = itemDetails.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const taxAmount = Math.round(
    parseFloat(order.tax_amount.toString())
  );

  const discountAmount = Math.round(
    parseFloat(order.discount_amount.toString())
  );

  // Tambahkan tax sebagai item agar total item = gross_amount
  if (taxAmount > 0) {
    itemDetails.push({
      id: "TAX",
      price: taxAmount,
      quantity: 1,
      name: "Tax 11%"
    });
  }

  // Discount dibuat negatif
  if (discountAmount > 0) {
    itemDetails.push({
      id: "DISCOUNT",
      price: -discountAmount,
      quantity: 1,
      name: "Discount"
    });
  }

  const itemDetailsTotal = itemDetails.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const grossAmount = Math.round(
    parseFloat(order.total_amount.toString())
  );

  if (itemDetailsTotal !== grossAmount) {
    throw new Error(
      `Midtrans amount mismatch: items=${itemDetailsTotal}, gross=${grossAmount}`
    );
  }
 const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";
 const finishUrl =
    `${frontendUrl}/order-status/` +
    `${order.order_number}?token=${order.secure_token}`;
  const snapToken = await midtransService.createTransaction({
    transaction_details: {
      order_id: order.order_number,
      gross_amount: grossAmount
    },

    item_details: itemDetails,

   callbacks: {
      finish: finishUrl
    }
  });

  const payment = await Payment.create({
    order_id: order.id,
    payment_method: order.payment_method,
    amount: grossAmount,
    status: "PENDING",
    payment_gateway: "MIDTRANS",
    snap_token: snapToken.token,
    redirect_url: snapToken.redirect_url
  });

  return payment;
}
export async function getPaymentById(paymentId: number): Promise<Payment | null> {
  return Payment.findByPk(paymentId, {
    include: [{ model: Order, as: "order" }]
  });
}

export async function getPaymentByOrderId(orderId: number): Promise<Payment | null> {
  return Payment.findOne({ where: { order_id: orderId } });
}

export async function checkAndUpdatePaymentStatus(orderNumber: string): Promise<Order | null> {
  const order = await Order.findOne({
    where: { order_number: orderNumber },
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      { model: Payment, as: "payment" }
    ]
  });

  if (!order) {
    return null;
  }

  if (order.payment_status === "PAID") {
    return order;
  }

  try {
    logger.info("Checking payment status with Midtrans", { orderNumber });
    const statusResponse = await midtransService.getTransactionStatus(orderNumber);

    if (statusResponse && statusResponse.transaction_status) {
      const gatewayStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      const mappedStatus = midtransService.getStatusMapping(gatewayStatus, fraudStatus);

      logger.info("Midtrans status response", { orderNumber, gatewayStatus, mappedStatus });

      if (mappedStatus === "PAID") {
        const existingPayment = await Payment.findOne({ where: { order_id: order.id } });
        await processSuccessfulPayment(order, existingPayment, statusResponse);

        return Order.findOne({
          where: { order_number: orderNumber },
          include: [
            { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
            { model: Payment, as: "payment" }
          ]
        });
      } else if (mappedStatus !== order.payment_status) {
        const existingPayment = await Payment.findOne({ where: { order_id: order.id } });
        if (existingPayment) {
          await existingPayment.update({ status: mappedStatus });
        }
        await order.update({ payment_status: mappedStatus });
      }
    }
  } catch (error) {
    logger.error("Failed to check/update payment status from Midtrans", {
      orderNumber,
      error: (error as Error).message
    });
  }

  return order;
}

const paymentService = {
  handleWebhook,
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  checkAndUpdatePaymentStatus
};

export default paymentService;




