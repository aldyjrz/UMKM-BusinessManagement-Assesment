import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "umkm_erp",
  process.env.DB_USER || "umkm_user",
  process.env.DB_PASSWORD || "umkm_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: "Asia/Jakarta"
  }
);

export default sequelize;
