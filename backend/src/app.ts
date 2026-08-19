import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { sequelize } from "./models";
import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/routes";
import productRoutes from "./modules/inventory/routes";
import customerRoutes from "./modules/customer/routes";
import salesRoutes from "./modules/sales/routes";
import paymentRoutes from "./modules/payment/routes";
import financeRoutes from "./modules/finance/routes";
import dashboardRoutes from "./modules/dashboard/routes";
import { sendSuccess } from "./utils/response";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173" ||  "http://localhost:5174",
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", apiLimiter);

//buat cek docker container
app.get("/health", (_req, res) => {
  sendSuccess(res, "Service is healthy");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", productRoutes);
app.use("/api/suppliers", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", salesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/inventory", productRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, _res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  next();
});

app.use(errorHandler);

async function connectDB(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
      logger.info("Database synced");
    }
  } catch (error) {
    logger.error("Database connection failed", { error: (error as Error).message });
    process.exit(1);
  }
}

connectDB();

export default app;


