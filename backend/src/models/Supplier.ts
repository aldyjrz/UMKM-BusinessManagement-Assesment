import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface SupplierAttributes {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, "id" | "created_at" | "updated_at"> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  declare id: number;
  declare name: string;
  declare phone: string | null;
  declare email: string | null;
  declare address: string | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Supplier.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(50), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
    address: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "suppliers",
    timestamps: true,
    underscored: true
  }
);

export default Supplier;




