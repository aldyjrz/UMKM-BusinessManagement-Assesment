import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingState, ErrorState } from "@/components/ui/LoadingStates";
import { formatCurrency, formatDate } from "@/utils/auth";

const OrderStatusPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState("");
  const initialToken = useMemo(() => searchParams.get("token"), [searchParams]);
  const [activeToken, setActiveToken] = useState<string | null>(initialToken);

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orderStatus", orderNumber, activeToken],
    queryFn: () => orderService.getStatus(orderNumber!, activeToken!),
    enabled: !!orderNumber && !!activeToken,
    retry: false,
  });

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setActiveToken(tokenInput.trim());
    }
  };

  if (isLoading) return <LoadingState message="Loading order status..." />;
  if (error)
    return (
      <ErrorState message="Failed to load order" onRetry={() => refetch()} />
    );

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Badge variant="warning">Enter your order token to view status</Badge>
        <div className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            type="text"
            placeholder="Secure token from your email/SMS"
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTokenSubmit()}
          />
          <Button onClick={handleTokenSubmit}>View Status</Button>
        </div>
      </div>
    );
  }

  const paymentStatusColors: Record<string, string> = {
    PENDING: "warning",
    PAID: "success",
    FAILED: "danger",
    EXPIRED: "warning",
    CANCELLED: "danger",
  };

  const orderStatusColors: Record<string, string> = {
    DRAFT: "secondary",
    PENDING_PAYMENT: "warning",
    PAID: "success",
    PROCESSING: "info",
    COMPLETED: "success",
    CANCELLED: "danger",
    EXPIRED: "warning",
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Order Status</h1>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium text-neutral-500">Order Number</h2>
            <p className="text-lg font-semibold text-neutral-800">{order.order_number}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-neutral-500">Order Date</h2>
            <p className="text-lg font-semibold text-neutral-800">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-neutral-500">Payment Status</h2>
            <Badge variant={(paymentStatusColors[order.payment_status] as any) || "neutral"}>
              {order.payment_status}
            </Badge>
          </div>
          <div>
            <h2 className="text-sm font-medium text-neutral-500">Order Status</h2>
            <Badge variant={(orderStatusColors[order.status] as any) || "neutral"}>
              {order.status}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Customer Information">
          <div className="space-y-2">
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-neutral-600">{order.customer_email}</p>
            <p className="text-sm text-neutral-600">{order.customer_phone}</p>
            <p className="text-sm text-neutral-600">{order.customer_address}</p>
            <p className="text-sm text-neutral-600">
              {order.customer_city}, {order.customer_postal_code}
            </p>
          </div>
        </Card>

        <Card title="Order Summary">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span>{formatCurrency(parseFloat(order.subtotal.toString()))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax</span>
              <span>{formatCurrency(parseFloat(order.tax_amount.toString()))}</span>
            </div>
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  {formatCurrency(parseFloat(order.total_amount.toString()))}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Order Items" className="mt-6">
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-neutral-600">
                  SKU: {item.product_sku} | x{item.quantity}
                </p>
              </div>
              <span>{formatCurrency(parseFloat(item.total_price.toString()))}</span>
            </div>
          ))}
        </div>
      </Card>

      {order.payment && (
        <Card title="Payment Method" className="mt-6">
          <p className="text-neutral-700">
            Payment Gateway: <strong>{order.payment.payment_gateway}</strong>
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Status:{" "}
            <Badge variant={order.payment.status === "PAID" ? "success" : "warning"}>
              {order.payment.status}
            </Badge>
          </p>
          {order.payment.snap_token && order.payment.status === "PENDING" && (
            <Button
              className="mt-4"
              variant="success"
              onClick={() => {
                const pending = {
                  order_number: order.order_number,
                  snap_token: order.payment?.snap_token,
                };
                localStorage.setItem("pending_order", JSON.stringify(pending));
                 window.location.href = `/order-status/${order.order_number}?token=${activeToken}`;
              }}
            >
              Pay Now
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default OrderStatusPage;
