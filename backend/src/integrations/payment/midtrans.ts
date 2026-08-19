import midtransClient from "midtrans-client";
import logger from "../../utils/logger";

export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
  address?: string;
}

export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCallbacks {
  finish: string;
}

export interface MidtransTransactionParams {
  transaction_details: MidtransTransactionDetails;
  customer_details?: MidtransCustomerDetails;
  item_details?: MidtransItemDetails[];
  enabled_payments?: string[];
  callbacks?: MidtransCallbacks;
}

export interface MidtransTransactionResult {
  token: string;
  redirect_url: string;
}

class MidtransService {
  private snap: any;
  private core: any;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
    });

    this.core = new midtransClient.CoreApi({
      isProduction: this.isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
    });
  }

  async createTransaction(params: MidtransTransactionParams): Promise<MidtransTransactionResult> {
    try {
      const result = await this.snap.createTransaction(params);
      logger.info("Midtrans transaction created", { orderId: params.transaction_details.order_id });
      return {
        token: result.token,
        redirect_url: result.redirect_url
      };
    } catch (error) {
      logger.error("Failed to create Midtrans transaction", { error: (error as Error).message });
      throw error;
    }
  }

  async getTransactionStatus(orderId: string): Promise<any> {
    try {
      const status = await this.core.transaction.status(orderId);
      logger.info("Midtrans transaction status retrieved", { orderId, status: status.transaction_status });
      return status;
    } catch (error) {
      logger.error("Failed to get Midtrans transaction status", { orderId, error: (error as Error).message });
      throw error;
    }
  }

  async verifySignatureKey(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): Promise<boolean> {
    try {
      const crypto = await import("crypto");
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
      const input = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const expectedSignature = crypto.createHash("sha512").update(input).digest("hex");
      return signatureKey === expectedSignature;
    } catch (error) {
      logger.error("Signature verification failed", { error: (error as Error).message });
      return false;
    }
  }

  getStatusMapping(gatewayStatus: string, fraudStatus?: string): "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" {
    if (gatewayStatus === "capture") {
      if (fraudStatus === "accept") return "PAID";
      if (fraudStatus === "reject") return "FAILED";
      return "PENDING";
    }
    if (gatewayStatus === "settlement") return "PAID";
    if (gatewayStatus === "deny") return "FAILED";
    if (gatewayStatus === "expire") return "EXPIRED";
    if (gatewayStatus === "cancel") return "CANCELLED";
    if (gatewayStatus === "pending") return "PENDING";
    return "PENDING";
  }
}

export default new MidtransService();
