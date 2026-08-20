import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import logger from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { error: (err as Error).message });
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.message });
  server.close(() => process.exit(1));
});

export default server;


