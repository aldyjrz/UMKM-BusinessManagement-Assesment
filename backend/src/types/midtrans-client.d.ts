declare module "midtrans-client" {
  interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export class Snap {
    constructor(options: MidtransClientOptions);
    createTransaction(params: any): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(params: any): Promise<string>;
  }

  export class CoreApi {
    constructor(options: MidtransClientOptions);
    transaction: {
      status(orderId: string): Promise<any>;
      charge(params: any): Promise<any>;
    };
  }

  export class Utils {
    static generate(orderId: string, grossAmount: number, serverKey: string): Promise<{ signature_key: string }>;
    static verify(params: any, signatureKey: string, serverKey: string): boolean;
  }

  export default {
    Snap: typeof Snap,
    CoreApi: typeof CoreApi,
    Utils: typeof Utils
  };

  export = {
    Snap,
    CoreApi,
    Utils
  };
}
