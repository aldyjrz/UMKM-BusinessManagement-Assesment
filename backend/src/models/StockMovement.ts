import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import Product from "./Product";

export enum MovementType {
  PURCHASE = "PURCHASE",
  SALE = "SALE",
  ADJUSTMENT = "ADJUSTMENT",
  RETURN = "RETURN"
}

interface StockMovementAttributes {
  id: number;
  product_id: number;
  type: MovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface StockMovementCreationAttributes extends Optional<StockMovementAttributes, "id" | "reference_id" | "reference_type" | "created_at" | "updated_at"> {}

class StockMovement extends Model<StockMovementAttributes, StockMovementCreationAttributes> implements StockMovementAttributes {
  declare id: number;
  declare product_id: number;
  declare type: MovementType;
  declare quantity: number;
  declare stock_before: number;
  declare stock_after: number;
  declare reference_id: string | null;
  declare reference_type: string | null;
  declare notes: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

StockMovement.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Product, key: "id" } },
    type: { type: DataTypes.ENUM(...Object.values(MovementType)), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    stock_before: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 0 } },
    stock_after: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 0 } },
    reference_id: { type: DataTypes.STRING(100), allowNull: true },
    reference_type: { type: DataTypes.STRING(50), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "stock_movements",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_movements_product", fields: ["product_id"] },
      { name: "idx_movements_type", fields: ["type"] }
    ]
  }
);

Product.hasMany(StockMovement, { foreignKey: "product_id", as: "movements" });
StockMovement.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default StockMovement;




