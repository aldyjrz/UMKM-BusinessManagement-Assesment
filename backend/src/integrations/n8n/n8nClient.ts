import https from "https";
import http from "http";
import logger from "../../utils/logger.js";

class N8nService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL || "";
  }

  async triggerWebhook(event: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn("N8N webhook URL not configured, skipping notification", { event });
      return;
    }

    const url = `${this.webhookUrl}/${event}`;
    const data = JSON.stringify(payload);

    const timeout = 10000;
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const lib = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      },
      timeout
    };

    try {
      await new Promise<void>((resolve) => {
        const req = lib.request(options, (res) => {
          logger.info("N8N webhook response " , { event, statusCode: res.statusCode });
          res.resume();
          resolve();
        });

        req.on("error", (_error) => {
          logger.error("N8N webhook request failed" +url, { event, error: (_error as Error).message });
          resolve();
        });

        req.on("timeout", () => {
          req.destroy();
          logger.warn("N8N webhook timed out", { event });
          resolve();
        });

        req.write(data);
        req.end();
      });
    } catch (error) {
      logger.error("N8N webhook trigger failed", { event, error: (error as Error).message });
    }
  }

  async triggerPaymentNotification(payload: { orderId: number; orderNumber: string; amount: number; customerEmail: string }): Promise<void> {
    await this.triggerWebhook("payment-notification", payload);
  }

  async triggerLowStockNotification(payload: { productId: number; productName: string; currentStock: number; minimumStock: number }): Promise<void> {
    await this.triggerWebhook("low-stock-notification", payload);
  }
 
}

export default new N8nService();


