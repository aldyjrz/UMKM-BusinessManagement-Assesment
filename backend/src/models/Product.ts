import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";
import Category from "./Category.js";
import Supplier from "./Supplier.js";

interface ProductAttributes {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  minimum_stock: number;
  category_id: number | null;
  supplier_id: number | null;
  image: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: Date;
  updated_at: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "created_at" | "updated_at"> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number;
  declare sku: string;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare cost: number;
  declare stock: number;
  declare minimum_stock: number;
  declare category_id: number | null;
  declare supplier_id: number | null;
  declare image: string | null;
  declare status: "ACTIVE" | "INACTIVE";
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
    cost: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
    stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    minimum_stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    category_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: Category, key: "id" } },
    supplier_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: Supplier, key: "id" } },
    image: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false, defaultValue: "ACTIVE" },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_products_sku", fields: ["sku"] },
      { name: "idx_products_category", fields: ["category_id"] },
      { name: "idx_products_status", fields: ["status"] }
    ]
  }
);

Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Product.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Supplier.hasMany(Product, { foreignKey: "supplier_id", as: "products" });

export default Product;




