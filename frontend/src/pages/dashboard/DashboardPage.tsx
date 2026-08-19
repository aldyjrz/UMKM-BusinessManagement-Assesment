import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";
import { Card } from "@/components/ui/Card";
import { LoadingState, ErrorState } from "@/components/ui/LoadingStates";
import { formatCurrency } from "@/utils/auth";

const StatCard = ({ title, value, icon, trend }: { title: string; value: string; icon: string; trend?: string }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm border border-neutral-200">
    <div className="flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
        {trend && <p className="text-xs text-neutral-400">{trend}</p>}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboardData(),
    refetchInterval: 30000
  });

  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Revenue" value={formatCurrency(data.todayRevenue)} />
        <StatCard title="Today's Orders" value={String(data.todayOrders)} />
        <StatCard title="Monthly Revenue" value={formatCurrency(data.monthlyRevenue)}/>
        <StatCard title="Low Stock" value={String(data.lowStockProducts)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={String(data.totalCustomers)} />
        <StatCard title="Total Products" value={String(data.totalProducts)} />
        <StatCard title="Pending Payments" value={String(data.pendingPayments)} />
        <StatCard title="Net Profit" value={formatCurrency(data.netProfit)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Revenue per Day">
          <div className="h-64">
            <ResponsiveBarChart data={data.dailyRevenue || []} />
          </div>
        </Card>

        <Card title="Order Status">
          <div className="h-64">
            <ResponsivePieChart data={data.orderCounts || []} />
          </div>
        </Card>
      </div>

      <Card title="Top Products">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-2 text-left font-medium text-neutral-700">Product</th>
                <th className="px-4 py-2 text-center font-medium text-neutral-700">Sold</th>
                <th className="px-4 py-2 text-right font-medium text-neutral-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts?.map((product: any) => (
                <tr key={product.name} className="border-b border-neutral-100">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2 text-center">{product.totalSold}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ResponsiveBarChart = ({ data }: { data: Array<{ date: string; revenue: number }> }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-neutral-500 py-8">No data available</p>;
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end justify-between h-full gap-2">
      {data.map((item) => (
        <div key={item.date} className="flex flex-1 flex-col items-center">
          <div className="relative w-full">
            <div
              className="mx-auto w-full max-w-[40px] rounded-t bg-primary-500 transition-all"
              style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
              title={`${item.date}: ${formatCurrency(item.revenue)}`}
            />
          </div>
          <span className="mt-1 text-xs text-neutral-500">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

const ResponsivePieChart = ({ data }: { data: Array<{ status: string; count: number }> }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-neutral-500 py-8">No data available</p>;
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors: Record<string, string> = {
    DRAFT: "bg-neutral-400",
    PENDING_PAYMENT: "bg-warning-400",
    PAID: "bg-success-400",
    PROCESSING: "bg-primary-400",
    COMPLETED: "bg-success-500",
    CANCELLED: "bg-danger-400",
    EXPIRED: "bg-neutral-400"
  };

  const slices = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const colorClass = colors[item.status] || "bg-neutral-400";
    const slice = {
      percentage,
      colorClass,
      offset: data.slice(0, index).reduce((acc, prev) => acc + (prev.count / total) * 100, 0),
      label: item.status
    };
    return slice;
  });

  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          {slices.map((slice, index) => {
            const startAngle = (slice.offset / 100) * 360;
            const endAngle = ((slice.offset + slice.percentage) / 100) * 360;
            const largeArc = slice.percentage > 50 ? 1 : 0;

            const rad = (Math.PI / 180) * (startAngle - 90);
            const x1 = 50 + 40 * Math.cos(rad);
            const y1 = 50 + 40 * Math.sin(rad);

            const rad2 = (Math.PI / 180) * (endAngle - 90);
            const x2 = 50 + 40 * Math.cos(rad2);
            const y2 = 50 + 40 * Math.sin(rad2);

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                className={slice.colorClass}
                fill="currentColor"
                style={{ color: slice.colorClass.replace("bg-", "").replace("-400", "-500").replace("-500", "500") }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-700">{total} total</span>
        </div>
      </div>
      <div className="ml-4 space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${slice.colorClass.replace("-400", "-500")}`}></div>
            <span className="text-xs text-neutral-600">{data[index].status}: {data[index].count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

