import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingState, ErrorState } from "@/components/ui/LoadingStates";
import { formatCurrency } from "@/utils/auth";

const CustomerOrdersPage = () => {
  const orderId = window.location.pathname.split("/").pop();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(parseInt(orderId || "0")),
    enabled: !!orderId
  });

  if (isLoading) return <LoadingState message="Loading order..." />;
  if (error) return <ErrorState message="Failed to load order" />;
  if (!order) return null;

  const statusColors: Record<string, any> = {
    DRAFT: "secondary",
    PENDING_PAYMENT: "warning",
    PAID: "success",
    PROCESSING: "info",
    COMPLETED: "success",
    CANCELLED: "danger",
    EXPIRED: "warning"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title={`Order ${order.order_number}`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Customer</h3>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-neutral-600">{order.customer_email}</p>
          </div>
          <div className="flex justify-end">
            <Badge variant={statusColors[order.status] || "neutral"}>{order.status}</Badge>
          </div>
        </div>
      </Card>

      <Card title="Order Items" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Product</th>
                <th className="px-4 py-2 text-center font-medium text-neutral-700">Qty</th>
                <th className="px-4 py-2 text-right font-medium text-neutral-700">Price</th>
                <th className="px-4 py-2 text-right font-medium text-neutral-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="px-4 py-2">{item.product_name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(parseFloat(item.total_price.toString()))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-4">
          <div className="flex justify-between">
            <span className="text-neutral-600">Subtotal</span>
            <span>{formatCurrency(parseFloat(order.subtotal?.toString() || "0"))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Tax</span>
            <span>{formatCurrency(parseFloat(order.tax_amount?.toString() || "0"))}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(parseFloat(order.total_amount?.toString() || "0"))}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerOrdersPage;


