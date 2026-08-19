import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LoadingState,
  ErrorState
} from "@/components/ui/LoadingStates";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/utils/auth";

const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  /**
   * Convert URL parameter to number safely.
   *
   * Example:
   * /admin/orders/15
   * id = "15"
   * orderId = 15
   */
  const orderId = Number(id);

  const isValidOrderId =
    Number.isInteger(orderId) && orderId > 0;

  /**
   * Get order detail
   */
  const {
    data: order,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin-order", orderId],

    queryFn: async () => {
      if (!isValidOrderId) {
        throw new Error("Invalid order ID");
      }

      return orderService.getById(orderId);
    },

    enabled: isValidOrderId
  });

  /**
   * Update order status
   */
  const updateMutation = useMutation({
    mutationFn: async (data: {
      status?: string;
      payment_status?: string;
    }) => {
      if (!isValidOrderId) {
        throw new Error("Invalid order ID");
      }

      return orderService.updateStatus(orderId, data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-order", orderId]
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-orders"]
      });

      showToast(
        "Order updated successfully",
        "success"
      );
    },

    onError: (error: any) => {
      console.error(
        "Update order error:",
        error
      );

      showToast(
        error?.response?.data?.message ||
          "Failed to update order",
        "error"
      );
    }
  });

  /**
   * Invalid ID
   *
   * This prevents:
   *
   * WHERE Order.id = NaN
   */
  if (!isValidOrderId) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/orders")}
        >
          &larr; Back to Orders
        </Button>

        <ErrorState message="Invalid order ID" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Loading order details..." />
    );
  }

  if (error) {
    console.error("Failed to load order:", error);

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/orders")}
        >
          &larr; Back to Orders
        </Button>

        <ErrorState message="Failed to load order" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/orders")}
        >
          &larr; Back to Orders
        </Button>

        <ErrorState message="Order not found" />
      </div>
    );
  }

  /**
   * Status colors
   */
  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    PENDING_PAYMENT: "warning",
    PAID: "success",
    PROCESSING: "info",
    COMPLETED: "success",
    CANCELLED: "danger",
    EXPIRED: "warning"
  };

  /**
   * Payment status colors
   */
  const paymentStatusColors: Record<string, string> = {
    PENDING: "warning",
    PAID: "success",
    FAILED: "danger",
    EXPIRED: "warning",
    CANCELLED: "danger"
  };

  /**
   * Allowed next statuses
   */
  const nextStatuses: Record<string, string[]> = {
    PENDING_PAYMENT: [
      "PAID",
      "CANCELLED",
      "EXPIRED"
    ],

    PAID: [
      "PROCESSING",
      "CANCELLED"
    ],

    PROCESSING: [
      "COMPLETED",
      "CANCELLED"
    ],

    COMPLETED: [],

    CANCELLED: [],

    EXPIRED: [],

    DRAFT: [
      "PENDING_PAYMENT",
      "CANCELLED"
    ]
  };

  const availableStatuses =
    nextStatuses[order.status] || [];

  /**
   * Update status handler
   */
  const handleStatusUpdate = (status: string) => {
    updateMutation.mutate({
      status
    });
  };

  /**
   * Safe number helper
   */
  const toNumber = (value: unknown): number => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const subtotal = toNumber(order.subtotal);
  const taxAmount = toNumber(order.tax_amount);
  const discountAmount = toNumber(
    order.discount_amount
  );
  const totalAmount = toNumber(
    order.total_amount
  );

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            &larr; Back to Orders
          </Button>

          <h1 className="mt-2 text-2xl font-bold text-neutral-800">
            Order {order.order_number}
          </h1>

          <p className="text-sm text-neutral-500">
            Created{" "}
            {formatDate(order.created_at)}
          </p>
        </div>

        {/* Order ID */}
        <div className="text-right">
          <p className="text-xs text-neutral-400">
            Order ID
          </p>

          <p className="font-mono text-sm text-neutral-600">
            #{order.id}
          </p>
        </div>
      </div>

      {/* =====================================================
          ORDER + CUSTOMER
      ====================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Order Information */}
        <Card
          title="Order Information"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-neutral-500">
                Order Status
              </p>

              <div className="mt-1">
                <Badge
                  variant={
                    (statusColors[
                      order.status
                    ] as any) || "neutral"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Payment Status
              </p>

              <div className="mt-1">
                <Badge
                  variant={
                    (paymentStatusColors[
                      order.payment_status
                    ] as any) || "neutral"
                  }
                >
                  {order.payment_status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Order Number
              </p>

              <p className="font-medium">
                {order.order_number}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Created
              </p>

              <p className="font-medium">
                {formatDate(order.created_at)}
              </p>
            </div>

            {order.secure_token && (
              <div className="col-span-2">
                <p className="text-sm text-neutral-500">
                  Secure Token
                </p>

                <code className="break-all text-xs text-neutral-600">
                  {order.secure_token}
                </code>
              </div>
            )}
          </div>
        </Card>

        {/* Customer Information */}
        <Card title="Customer Information">
          <div className="space-y-2">
            <p className="font-medium">
              {order.customer_name}
            </p>

            <p className="text-sm text-neutral-600">
              {order.customer_email}
            </p>

            <p className="text-sm text-neutral-600">
              {order.customer_phone}
            </p>

            <p className="text-sm text-neutral-600">
              {order.customer_address}
            </p>

            <p className="text-sm text-neutral-600">
              {order.customer_city},{" "}
              {order.customer_postal_code}
            </p>
          </div>
        </Card>
      </div>

      {/* =====================================================
          STATUS ACTION
      ====================================================== */}
      {availableStatuses.length > 0 && (
        <Card title="Update Order Status">
          <div className="flex flex-wrap gap-3">

            {availableStatuses.map(
              (status) => (
                <Button
                  key={status}
                  variant={
                    status === "CANCELLED"
                      ? "danger"
                      : status === "PAID"
                      ? "success"
                      : "primary"
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  isLoading={
                    updateMutation.isPending
                  }
                  onClick={() =>
                    handleStatusUpdate(status)
                  }
                >
                  {status.replace(
                    /_/g,
                    " "
                  )}
                </Button>
              )
            )}

          </div>
        </Card>
      )}

      {/* =====================================================
          ORDER ITEMS
      ====================================================== */}
      <Card title="Order Items">
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="bg-neutral-50">

                <th className="px-4 py-2 text-left font-medium text-neutral-700">
                  Product
                </th>

                <th className="px-4 py-2 text-left font-medium text-neutral-700">
                  SKU
                </th>

                <th className="px-4 py-2 text-center font-medium text-neutral-700">
                  Qty
                </th>

                <th className="px-4 py-2 text-right font-medium text-neutral-700">
                  Unit Price
                </th>

                <th className="px-4 py-2 text-right font-medium text-neutral-700">
                  Total
                </th>

              </tr>
            </thead>

            <tbody>

              {order.items?.length ? (
                order.items.map(
                  (item: any) => (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-100"
                    >

                      <td className="px-4 py-3 font-medium">
                        {item.product_name}
                      </td>

                      <td className="px-4 py-3 text-neutral-600">
                        {item.product_sku}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          toNumber(
                            item.unit_price
                          )
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(
                          toNumber(
                            item.total_price
                          )
                        )}
                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-neutral-500"
                  >
                    No items found
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>

        {/* Order totals */}
        <div className="mt-4 border-t border-neutral-200 pt-4">

          <div className="flex justify-between">
            <span className="text-neutral-600">
              Subtotal
            </span>

            <span>
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-600">
              Tax
            </span>

            <span>
              {formatCurrency(taxAmount)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-danger-600">

              <span>
                Discount
              </span>

              <span>
                -
                {formatCurrency(
                  discountAmount
                )}
              </span>

            </div>
          )}

          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-lg font-bold">

            <span>
              Total
            </span>

            <span className="text-primary-600">
              {formatCurrency(totalAmount)}
            </span>

          </div>

        </div>
      </Card>

      {/* =====================================================
          PAYMENT INFORMATION
      ====================================================== */}
      {order.payment && (
        <Card title="Payment Information">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-neutral-500">
                Gateway
              </p>

              <p className="font-medium">
                {order.payment.payment_gateway ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Method
              </p>

              <p className="font-medium">
                {order.payment.payment_method ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Amount
              </p>

              <p className="font-medium">
                {formatCurrency(
                  toNumber(
                    order.payment.amount
                  )
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">
                Status
              </p>

              <Badge
                variant={
                  (paymentStatusColors[
                    order.payment.status
                  ] as any) || "neutral"
                }
              >
                {order.payment.status}
              </Badge>
            </div>

            {order.payment
              .gateway_transaction_id && (
              <div className="col-span-full">
                <p className="text-sm text-neutral-500">
                  Gateway Transaction ID
                </p>

                <code className="break-all text-xs text-neutral-600">
                  {
                    order.payment
                      .gateway_transaction_id
                  }
                </code>
              </div>
            )}

            {order.payment.snap_token && (
              <div className="col-span-full">
                <p className="text-sm text-neutral-500">
                  Snap Token
                </p>

                <code className="break-all text-xs text-neutral-600">
                  {order.payment.snap_token}
                </code>
              </div>
            )}

            {order.payment.redirect_url && (
              <div className="col-span-full">
                <p className="text-sm text-neutral-500">
                  Payment URL
                </p>

                <a
                  href={
                    order.payment.redirect_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-primary-600 hover:underline"
                >
                  {
                    order.payment.redirect_url
                  }
                </a>
              </div>
            )}

            {order.payment.created_at && (
              <div>
                <p className="text-sm text-neutral-500">
                  Payment Created
                </p>

                <p className="font-medium">
                  {formatDate(
                    order.payment.created_at
                  )}
                </p>
              </div>
            )}

          </div>

          {order.payment.gateway_response && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                Gateway Response
              </summary>

              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-neutral-50 p-4 text-xs text-neutral-700">
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(
                        order.payment
                          .gateway_response
                      ),
                      null,
                      2
                    );
                  } catch {
                    return order.payment
                      .gateway_response;
                  }
                })()}
              </pre>
            </details>
          )}

        </Card>
      )}

      {/* =====================================================
          NOTES
      ====================================================== */}
      {order.notes && (
        <Card title="Order Notes">
          <p className="whitespace-pre-wrap text-sm text-neutral-700">
            {order.notes}
          </p>
        </Card>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="flex justify-end gap-3">

        <Button
          variant="ghost"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          Back to Orders
        </Button>

      </div>

    </div>
  );
};

export default AdminOrderDetailPage;