import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/LoadingStates";
import { formatDate } from "@/utils/auth";
import { Link } from "react-router-dom";

const MyOrdersPage = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderService.getMyOrders(),
    retry: false
  });

  if (isLoading) return <LoadingState message="Loading your orders..." />;
  if (error) return <ErrorState message="Failed to load orders" />;

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-6 text-2xl font-bold text-neutral-800">My Orders</h1>
        <EmptyState message="You haven't placed any orders yet" actionLabel="Browse Products" onAction={() => (window.location.href = "/products")} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-800">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <Card key={order.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800">{order.order_number}</h3>
                <p className="text-sm text-neutral-600">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge variant={order.status === "PAID" ? "success" : "warning"}>{order.status}</Badge>
                <Link
                  to={`/order-status/${order.order_number}?token=${order.secure_token}`}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  View
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;


