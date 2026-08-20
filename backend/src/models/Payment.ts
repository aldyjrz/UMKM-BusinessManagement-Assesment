import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";
import Order from "./Order.js";

interface PaymentAttributes {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  payment_gateway: string;
  gateway_transaction_id: string | null;
  gateway_response: string | null;
  snap_token: string | null;
  redirect_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, "id" | "gateway_transaction_id" | "gateway_response" | "redirect_url" | "created_at" | "updated_at"> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: number;
  declare order_id: number;
  declare payment_method: string;
  declare amount: number;
  declare status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  declare payment_gateway: string;
  declare gateway_transaction_id: string | null;
  declare gateway_response: string | null;
  declare snap_token: string | null;
  declare redirect_url: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: Order, key: "id" } },
    payment_method: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "BANK_TRANSFER" },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING"
    },
    payment_gateway: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "MIDTRANS" },
    gateway_transaction_id: { type: DataTypes.STRING(255), allowNull: true },
    gateway_response: { type: DataTypes.TEXT, allowNull: true },
    snap_token: { type: DataTypes.STRING(255), allowNull: true },
    redirect_url: { type: DataTypes.STRING(500), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "payments",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_payments_order", fields: ["order_id"] },
      { name: "idx_payments_status", fields: ["status"] },
      { name: "idx_payments_gateway_txn", fields: ["gateway_transaction_id"] }
    ]
  }
);

Order.hasOne(Payment, { foreignKey: "order_id", as: "payment" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });

export default Payment;




