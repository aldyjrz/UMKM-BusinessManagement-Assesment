import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface CustomerAttributes {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  type: "GUEST" | "REGISTERED";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, "id" | "user_id" | "is_active" | "created_at" | "updated_at"> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  declare id: number;
  declare user_id: number | null;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare address: string;
  declare city: string;
  declare postal_code: string;
  declare type: "GUEST" | "REGISTERED";
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Customer.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, references: { model: User, key: "id" } },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(50), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    postal_code: { type: DataTypes.STRING(20), allowNull: false },
    type: { type: DataTypes.ENUM("GUEST", "REGISTERED"), allowNull: false, defaultValue: "GUEST" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "customers",
    timestamps: true,
    underscored: true,
    indexes: [{ name: "idx_customers_email", fields: ["email"] }, { name: "idx_customers_type", fields: ["type"] }]
  }
);

Customer.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Customer, { foreignKey: "user_id", as: "customers" });

export default Customer;




