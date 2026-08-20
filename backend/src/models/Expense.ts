import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";

interface ExpenseAttributes {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, "id" | "created_at" | "updated_at"> {}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  declare id: number;
  declare category: string;
  declare amount: number;
  declare description: string | null;
  declare expense_date: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Expense.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    category: { type: DataTypes.STRING(100), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    description: { type: DataTypes.TEXT, allowNull: true },
    expense_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "expenses",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_expenses_category", fields: ["category"] },
      { name: "idx_expenses_date", fields: ["expense_date"] }
    ]
  }
);

export default Expense;




