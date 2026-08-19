import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/LoadingStates";
import { formatCurrency, formatDate } from "@/utils/auth";
import { Link } from "react-router-dom";
import type { Order } from "@/types";

const AdminOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () => orderService.getAll({
      status: statusFilter || undefined,
      limit,
      offset: page * limit
    })
  });

  const { data: stats } = useQuery({
    queryKey: ["order-stats"],
    queryFn: () => orderService.getStats()
  });

  const statusOptions = [
    { value: "", label: "All Orders" },
    { value: "PENDING_PAYMENT", label: "Pending Payment" },
    { value: "PAID", label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "EXPIRED", label: "Expired" }
  ];

  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    PENDING_PAYMENT: "warning",
    PAID: "success",
    PROCESSING: "info",
    COMPLETED: "success",
    CANCELLED: "danger",
    EXPIRED: "warning"
  };

  const paymentStatusColors: Record<string, string> = {
    PENDING: "warning",
    PAID: "success",
    FAILED: "danger",
    EXPIRED: "warning",
    CANCELLED: "danger"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">Orders</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card noPadding>
            <div className="p-4">
              <p className="text-sm text-neutral-500">Total Orders</p>
              <p className="text-xl font-bold text-neutral-800">{stats.total}</p>
            </div>
          </Card>
          <Card noPadding>
            <div className="p-4">
              <p className="text-sm text-neutral-500">Pending Payment</p>
              <p className="text-xl font-bold text-warning-600">{stats.pending}</p>
            </div>
          </Card>
          <Card noPadding>
            <div className="p-4">
              <p className="text-sm text-neutral-500">Paid</p>
              <p className="text-xl font-bold text-success-600">{stats.paid}</p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(0); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-primary-600 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading orders..." />
      ) : error ? (
        <ErrorState message="Failed to load orders" />
      ) : !orders || orders.length === 0 ? (
        <EmptyState message="No orders found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Amount</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-700">Status</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-700">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Date</th>
                <th className="px-4 py-3 text-center font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-primary-600">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-neutral-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(parseFloat(order.total_amount.toString()))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={(statusColors[order.status] as any) || "neutral"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={(paymentStatusColors[order.payment_status] as any) || "neutral"}>
                      {order.payment_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders && orders.length >= limit && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-neutral-600">
            Page {page + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={orders.length < limit}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
