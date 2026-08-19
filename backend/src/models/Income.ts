import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import Order from "./Order";

interface IncomeAttributes {
  id: number;
  order_id: number;
  amount: number;
  payment_id: number | null;
  description: string | null;
  source: string;
  created_at: Date;
  updated_at: Date;
}

interface IncomeCreationAttributes extends Optional<IncomeAttributes, "id" | "description" | "payment_id" | "created_at" | "updated_at"> {}

class Income extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
  declare id: number;
  declare order_id: number;
  declare amount: number;
  declare payment_id: number | null;
  declare description: string | null;
  declare source: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Income.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Order, key: "id" } },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    payment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    source: { type: DataTypes.STRING(100), allowNull: false, defaultValue: "PAYMENT" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "incomes",
    timestamps: true,
    underscored: true,
    indexes: [{ name: "idx_incomes_order", fields: ["order_id"] }, { name: "idx_incomes_created", fields: ["created_at"] }]
  }
);

Order.hasOne(Income, { foreignKey: "order_id", as: "income" });
Income.belongsTo(Order, { foreignKey: "order_id", as: "order" });

export default Income;




