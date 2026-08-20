import Order, { OrderStatus } from "../../models/Order.js";
import OrderItem from "../../models/OrderItem.js";
import Product from "../../models/Product.js";
import Customer from "../../models/Customer.js";
import Payment from "../../models/Payment.js";
import { sequelize } from "../../models/index.js";
import { generateOrderNumber, generateSecureToken } from "../../utils/response.js";
import midtransService from "../../integrations/payment/midtrans.js";
import logger from "../../utils/logger.js";

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface GuestCheckoutInput {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
  };
  items: OrderItemInput[];
  notes?: string;
}

export async function createGuestOrder(input: GuestCheckoutInput): Promise<{ order: Order; payment: Payment }> {
  const t = await sequelize.transaction();

  try {
    let customer = await Customer.findOne({ where: { email: input.customer.email } });

    if (!customer) {
      customer = await Customer.create(
        {
          ...input.customer,
          type: "GUEST"
        },
        { transaction: t }
      );
      logger.info("New guest customer created", { email: input.customer.email });
    }

    const orderNumber = generateOrderNumber();
    const secureToken = generateSecureToken();

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of input.items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
       if (!product) {
         throw new Error(`Product with ID ${item.product_id} not found`);
       }
       if (product.status !== "ACTIVE") {
        throw new Error(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      const unitPrice = Math.round(parseFloat(product.price.toString()));
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

       orderItems.push({
        product_id: item.product_id,
        order_id: 0,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });
    }

    const taxAmount = Math.round(subtotal * 0.11);
    const discountAmount = 0;
    const totalAmount = Math.round(subtotal + taxAmount - discountAmount);

    const order = await Order.create(
      {
        order_number: orderNumber,
        customer_id: customer.id,
        customer_name: input.customer.name,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
        customer_address: input.customer.address,
        customer_city: input.customer.city,
        customer_postal_code: input.customer.postal_code,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        status: OrderStatus.PENDING_PAYMENT,
        payment_status: "PENDING",
        secure_token: secureToken,
        notes: input.notes || null
      },
      { transaction: t }
    );
 const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const finishUrl = `${frontendUrl}/order-status/${order.order_number}?token=${order.secure_token}`;

    for (const orderItem of orderItems) {
      await OrderItem.create(
        { ...orderItem, order_id: order.id },
        { transaction: t }
      );
    }

    const { token: snapToken, redirect_url: redirectUrl } = await midtransService.createTransaction({
      transaction_details: {
        order_id: order.order_number,
        gross_amount: Math.round(totalAmount)
      },
      customer_details: {
        first_name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        address: input.customer.address
      },
      item_details: (() => {
        const details: Array<{ id: string; price: number; quantity: number; name: string }> = orderItems.map((item) => ({
          id: item.product_sku,
          price: Math.round(item.unit_price),
          quantity: item.quantity,
          name: item.product_name
        }));
         if (taxAmount > 0) {
          details.push({
            id: "TAX",
            price: taxAmount,
            quantity: 1,
            name: "Tax 11%"
          });
        }

        if (discountAmount > 0) {
          details.push({
            id: "DISCOUNT",
            price: -discountAmount,
            quantity: 1,
            name: "Discount"
          });
        }

        return details;
      })(),
     callbacks: {
      finish: finishUrl
    }
    });

    const payment = await Payment.create(
      {
        order_id: order.id,
        payment_method: "BANK_TRANSFER",
        amount: totalAmount,
        status: "PENDING",
        payment_gateway: "MIDTRANS",
        snap_token: snapToken,
        redirect_url: redirectUrl
      },
      { transaction: t }
    );

    await t.commit();
    logger.info("Guest order created", { orderNumber, amount: totalAmount });

    return { order, payment };
  } catch (error) {
    await t.rollback();
    logger.error("Failed to create guest order", { error: (error as Error).message });
    throw error;
  }
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  return Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: "items" },
      { model: Customer, as: "customer" },
      { model: Payment, as: "payment" }
    ]
  });
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const order = await Order.findOne({
    where: { order_number: orderNumber },
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      { model: Payment, as: "payment" }
    ]
  });
  return order;
}

export async function getOrderStatus(orderNumber: string, secureToken: string): Promise<Order | null> {
  return Order.findOne({
    where: { order_number: orderNumber, secure_token: secureToken },
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] },
      { model: Payment, as: "payment" }
    ]
  });
}

export async function getAllOrders(filters?: { status?: string; limit?: number; offset?: number }): Promise<Order[]> {
  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }

  return Order.findAll({
    where,
    limit: filters?.limit,
    offset: filters?.offset,
    include: [
      { model: OrderItem, as: "items" },
      { model: Payment, as: "payment" }
    ],
    order: [["created_at", "DESC"]]
  });
}

export async function getOrderTotalStats(): Promise<{ total: number; pending: number; paid: number }> {
  const results = await Promise.all([
    Order.count(),
    Order.count({ where: { payment_status: "PENDING", status: OrderStatus.PENDING_PAYMENT } }),
    Order.count({ where: { payment_status: "PAID" } })
  ]);

  return { total: results[0], pending: results[1], paid: results[2] };
}

export async function updateOrderStatus(
  orderId: number,
  updates: { status?: string; payment_status?: string }
): Promise<Order | null> {
  const order = await Order.findByPk(orderId);
  if (!order) return null;

  const updateData: any = { updated_at: new Date() };
  if (updates.status) {
    updateData.status = updates.status;
  }
  if (updates.payment_status) {
    updateData.payment_status = updates.payment_status;
  }

  await order.update(updateData);
  return getOrderById(orderId);
}

export async function getPaymentForOrder(orderId: number): Promise<Payment | null> {
  return Payment.findOne({ where: { order_id: orderId } });
}

const salesService = {
  createGuestOrder,
  getOrderById,
  getOrderByNumber,
  getOrderStatus,
  getAllOrders,
  getOrderTotalStats,
  updateOrderStatus,
  getPaymentForOrder
};

export default salesService;




