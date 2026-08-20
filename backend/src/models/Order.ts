import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";
import Customer from "./Customer.js";

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

interface OrderAttributes {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  secure_token: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id" | "customer_id" | "secure_token" | "notes" | "created_at" | "updated_at"> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare id: number;
  declare order_number: string;
  declare customer_id: number | null;
  declare customer_name: string;
  declare customer_email: string;
  declare customer_phone: string;
  declare customer_address: string;
  declare customer_city: string;
  declare customer_postal_code: string;
  declare subtotal: number;
  declare tax_amount: number;
  declare discount_amount: number;
  declare total_amount: number;
  declare status: OrderStatus;
  declare payment_status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  declare secure_token: string;
  declare notes: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: Customer, key: "id" } },
    customer_name: { type: DataTypes.STRING(255), allowNull: false },
    customer_email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
    customer_phone: { type: DataTypes.STRING(50), allowNull: false },
    customer_address: { type: DataTypes.TEXT, allowNull: false },
    customer_city: { type: DataTypes.STRING(100), allowNull: false },
    customer_postal_code: { type: DataTypes.STRING(20), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    tax_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
    discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT
    },
    payment_status: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING"
    },
    secure_token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_orders_number", fields: ["order_number"] },
      { name: "idx_orders_status", fields: ["status"] },
      { name: "idx_orders_payment_status", fields: ["payment_status"] },
      { name: "idx_orders_token", fields: ["secure_token"] }
    ]
  }
);

Order.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Customer.hasMany(Order, { foreignKey: "customer_id", as: "orders" });

export default Order;




