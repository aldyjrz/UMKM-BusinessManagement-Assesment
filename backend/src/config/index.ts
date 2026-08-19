import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "change-this-in-production",
  sessionSecret: process.env.SESSION_SECRET || "change-this-in-production",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    database: process.env.DB_NAME || "umkm_erp",
    username: process.env.DB_USER || "umkm_user",
    password: process.env.DB_PASSWORD || "",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
  },
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || "",
  },
  logLevel: process.env.LOG_LEVEL || "info"
};


