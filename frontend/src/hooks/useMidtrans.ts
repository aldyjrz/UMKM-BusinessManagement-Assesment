import { useEffect, useState } from "react";

type SnapyPayOptions = {
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onError?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
};

const useMidtrans = (snapToken: string | null) => {
  const [snap, setSnap] = useState<Snap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      console.warn("Midtrans client key not configured");
      return;
    }

    let script: HTMLScriptElement | null = null;
    let isMounted = true;

    /* eslint-disable react-hooks/set-state-in-effect */
    if (window.snap) {
      if (isMounted) {
        setSnap(window.snap);
        setIsLoaded(true);
      }
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    const scriptId = "midtrans-snap-script";
    if (document.getElementById(scriptId)) {
      const checkSnap = setInterval(() => {
        if (window.snap) {
          if (isMounted) {
            setSnap(window.snap);
            setIsLoaded(true);
          }
          clearInterval(checkSnap);
        }
      }, 100);
      return () => {
        isMounted = false;
        clearInterval(checkSnap);
      };
    }

    script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => {
      if (isMounted) {
        setSnap(window.snap);
        setIsLoaded(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [snapToken]);

  const pay = (options?: SnapyPayOptions) => {
    if (snap && snapToken) {
      snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log("Payment success", result);
          options?.onSuccess?.(result);
        },
        onPending: (result) => {
          console.log("Payment pending", result);
          options?.onPending?.(result);
        },
        onError: (result) => {
          console.error("Payment error", result);
          options?.onError?.(result);
        },
        onClose: () => {
          console.log("Payment popup closed");
          options?.onClose?.();
        }
      });
    }
  };

  return { snap, isLoaded, pay, clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY };
};

export default useMidtrans;
