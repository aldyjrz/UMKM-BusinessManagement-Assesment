declare global {
  interface Window {
    snap: Snap;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Snap {
    pay(token: string, options: {
      onSuccess: (result: Record<string, unknown>) => void;
      onPending: (result: Record<string, unknown>) => void;
      onError: (result: Record<string, unknown>) => void;
      onClose: () => void;
    }): void;
  }

  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_MIDTRANS_CLIENT_KEY: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_CURRENCY: string;
    readonly VITE_FRONTEND_URL: string;
  }
}

export {};
