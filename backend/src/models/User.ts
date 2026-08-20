import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";

export enum UserRole {
  CUSTOMER = "customer", 
  ADMIN = "admin", 
}

interface UserAttributes {
  id: number;
  google_id: string | null;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  password: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "google_id" | "password" | "avatar" | "is_active" | "created_at" | "updated_at"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare google_id: string | null;
  declare email: string;
  declare name: string;
  declare avatar: string | null;
  declare role: UserRole;
  declare password: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    google_id: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    name: { type: DataTypes.STRING(255), allowNull: false },
    avatar: { type: DataTypes.STRING(500), allowNull: true },
    role: { type: DataTypes.ENUM(...Object.values(UserRole)), allowNull: false, defaultValue: UserRole.CUSTOMER },
    password: { type: DataTypes.STRING(255), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true
  }
);

export default User;




