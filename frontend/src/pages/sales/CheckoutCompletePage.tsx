import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import useMidtrans from "@/hooks/useMidtrans";
import { orderService } from "@/services";

const CheckoutCompletePage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const secureToken = searchParams.get("token");
  const { showToast } = useToast();
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  const { isLoaded, pay } = useMidtrans(snapToken);

  async function loadOrder() {
    try {
      // 1. Coba ambil dari localStorage terlebih dahulu
      const pending = localStorage.getItem("pending_order");
      if (pending) {
        const data = JSON.parse(pending);
        if (data.order_number === orderNumber && data.snap_token) {
          setOrderData(data);
          setSnapToken(data.snap_token);
          setIsLoading(false);
          return;
        }
      }

      // 2. Jika tidak ada di localStorage, coba ambil dari backend menggunakan secureToken
      if (orderNumber && secureToken) {
        const order = await orderService.getStatus(orderNumber, secureToken);
        if (order && order.payment) {
          setOrderData({ ...order, secure_token: order.secure_token });
          setSnapToken(order.payment.snap_token);
          setIsLoading(false);
          return;
        }
      }

      // 3. Jika tidak ada token atau gagal, set default
      setOrderData({ order_number: orderNumber });
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load order details", error);
      showToast("Failed to load order details", "error");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderNumber, secureToken]);

  const handlePaymentResult = (result: any) => {
    showToast("Payment successful", "success");
    localStorage.removeItem("pending_order");
    // Use actual secure_token from order data for the redirect
    const token = orderData?.secure_token || secureToken || "";
    const orderNum = result?.order_id || orderNumber;
    navigate(`/order-status/${orderNum}?token=${token}`);
  };

  useEffect(() => {
    if (isLoaded && snapToken) {
      pay({
        onSuccess: handlePaymentResult,
        onPending: () => {
          showToast("Payment pending", "info");
        },
        onError: () => {
          showToast("Payment failed", "error");
        },
        onClose: () => {
          showToast("Payment cancelled", "warning");
        },
      });
    }
  }, [isLoaded, snapToken]);

  const handlePay = () => {
    if (!snapToken) {
      showToast("Payment token not found", "error");
      return;
    }
    pay({
      onSuccess: handlePaymentResult,
      onPending: () => {
        showToast("Payment pending", "info");
      },
      onError: () => {
        showToast("Payment failed", "error");
      },
      onClose: () => {
        showToast("Payment cancelled", "warning");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600"></div>
        <p className="mt-4 text-neutral-600">Preparing payment gateway...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card title="Complete Your Payment" className="border border-neutral-200">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3-3 4 4 6-6 3 3v7H3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-neutral-800">Secure Payment</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Order #{orderData?.order_number || orderNumber}
            </p>
          </div>

          <div id="midtrans-snap-container" className="min-h-[400px]" />

          <div className="rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-600">
              After completing payment, you will receive a confirmation email and your order status will be updated automatically.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handlePay} disabled={!isLoaded || !snapToken} variant="success">
              {!isLoaded ? "Loading Payment..." : "Pay Now"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/products")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default CheckoutCompletePage;
