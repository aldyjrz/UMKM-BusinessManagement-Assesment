import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

interface OAuthAccountAttributes {
  id: number;
  user_id: number;
  provider: "google";
  provider_id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface OAuthAccountCreationAttributes extends Optional<OAuthAccountAttributes, "id" | "access_token" | "refresh_token" | "expires_at" | "created_at" | "updated_at"> {}

class OAuthAccount extends Model<OAuthAccountAttributes, OAuthAccountCreationAttributes> implements OAuthAccountAttributes {
  declare id: number;
  declare user_id: number;
  declare provider: "google";
  declare provider_id: string;
  declare access_token: string | null;
  declare refresh_token: string | null;
  declare expires_at: Date | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

OAuthAccount.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: User, key: "id" } },
    provider: { type: DataTypes.ENUM("google"), allowNull: false, defaultValue: "google" },
    provider_id: { type: DataTypes.STRING(255), allowNull: false },
    access_token: { type: DataTypes.TEXT, allowNull: true },
    refresh_token: { type: DataTypes.TEXT, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    tableName: "oauth_accounts",
    timestamps: true,
    underscored: true,
    indexes: [
      { name: "idx_oauth_provider_id", fields: ["provider", "provider_id"] },
      { name: "idx_oauth_user", fields: ["user_id"] }
    ]
  }
);

User.hasMany(OAuthAccount, { foreignKey: "user_id", as: "oauth_accounts" });
OAuthAccount.belongsTo(User, { foreignKey: "user_id", as: "user" });

export default OAuthAccount;




