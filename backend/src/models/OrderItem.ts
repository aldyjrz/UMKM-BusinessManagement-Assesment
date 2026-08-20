import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";
import Order from "./Order.js";
import Product from "./Product.js";

interface OrderItemAttributes {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id" | "created_at" | "updated_at"> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  declare id: number;
  declare order_id: number;
  declare product_id: number;
  declare product_name: string;
  declare product_sku: string;
  declare quantity: number;
  declare unit_price: number;
  declare total_price: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Order, key: "id" } },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: Product, key: "id" } },
    product_name: { type: DataTypes.STRING(255), allowNull: false },
    product_sku: { type: DataTypes.STRING(100), allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1 } },
    unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "order_items",
    timestamps: true,
    underscored: true
  }
);

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "order_items" });

export default OrderItem;




