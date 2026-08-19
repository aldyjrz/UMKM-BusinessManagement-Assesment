import Order from "../../models/Order";
import OrderItem from "../../models/OrderItem";
import Product from "../../models/Product";
import Customer from "../../models/Customer";
import Income from "../../models/Income";
import Expense from "../../models/Expense";
import { sequelize } from "../../models";
import { Op } from "sequelize";
export async function getDashboardData(): Promise<{
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingPayments: number;
  netProfit: number;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  monthlyRevenueData: Array<{ month: string; revenue: number }>;
  orderCounts: Array<{ status: string; count: number }>;
  topProducts: Array<{
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}> {
  const today = new Date();

  // =========================
  // DATE RANGE
  // =========================

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfTomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  );

  // =========================
  // DAILY REVENUE
  // =========================

  const dailyRevenueQuery = await Income.findAll({
    where: {
      created_at: {
        [Op.gte]: startOfDay,
        [Op.lt]: startOfTomorrow
      }
    },

    attributes: [
      [
        sequelize.fn(
          "DATE",
          sequelize.col("created_at")
        ),
        "date"
      ],

      [
        sequelize.fn(
          "SUM",
          sequelize.col("amount")
        ),
        "revenue"
      ]
    ],

    group: [
      sequelize.fn(
        "DATE",
        sequelize.col("created_at")
      )
    ],

    order: [
      [
        sequelize.fn(
          "DATE",
          sequelize.col("created_at")
        ),
        "ASC"
      ]
    ],

    raw: true
  });

  // =========================
  // MONTHLY REVENUE
  // =========================

  const monthlyRevenueQuery = await Income.findAll({
    where: {
      created_at: {
        [Op.gte]: startOfMonth,
        [Op.lt]: startOfNextMonth
      }
    },

    attributes: [
      [
        sequelize.fn(
          "DATE_FORMAT",
          sequelize.col("created_at"),
          "%Y-%m"
        ),
        "month"
      ],

      [
        sequelize.fn(
          "SUM",
          sequelize.col("amount")
        ),
        "revenue"
      ]
    ],

    group: [
      sequelize.fn(
        "DATE_FORMAT",
        sequelize.col("created_at"),
        "%Y-%m"
      )
    ],

    order: [
      [
        sequelize.fn(
          "DATE_FORMAT",
          sequelize.col("created_at"),
          "%Y-%m"
        ),
        "ASC"
      ]
    ],

    raw: true
  });

  // =========================
  // ORDER STATUS
  // =========================

  const orderStatuses = await Order.findAll({
    attributes: [
      ["status", "status"],

      [
        sequelize.fn(
          "COUNT",
          sequelize.col("id")
        ),
        "count"
      ]
    ],

    group: ["status"],

    raw: true
  });

  // =========================
  // TOP PRODUCTS
  // =========================

 const topProductsQuery = await OrderItem.findAll({
  attributes: [
    ["product_name", "name"],

    [
      sequelize.fn(
        "SUM",
        sequelize.col("OrderItem.quantity")
      ),
      "totalSold"
    ],

    [
      sequelize.fn(
        "SUM",
        sequelize.col("OrderItem.total_price")
      ),
      "revenue"
    ]
  ],

  include: [
    {
      model: Order,
      as: "order",
      attributes: [],
      where: {
        payment_status: "PAID"
      },
      required: true
    }
  ],

  group: ["product_name"],

  order: [
    [
      sequelize.literal("revenue"),
      "DESC"
    ]
  ],

  limit: 5,

  raw: true
});
  // =========================
  // SUMMARY
  // =========================

  const [
    todayRevenueRes,
    todayOrdersRes,
    monthlyRevenueRes,
    totalCustomersRes,
    totalProductsRes,
    lowStockRes,
    pendingPaymentsRes,
    totalExpenseRes
  ] = await Promise.all([

    // Today revenue
    Income.sum("amount", {
      where: {
        created_at: {
          [Op.gte]: startOfDay,
          [Op.lt]: startOfTomorrow
        }
      }
    }),

    // Today orders
    Order.count({
      where: {
        created_at: {
          [Op.gte]: startOfDay,
          [Op.lt]: startOfTomorrow
        }
      }
    }),

    // Monthly revenue
    Income.sum("amount", {
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth
        }
      }
    }),

    // Total customers
    Customer.count(),

    // Total products
    Product.count(),

    // Low stock
    Product.count({
      where: {
        stock: {
          [Op.lte]: sequelize.col("minimum_stock")
        }
      }
    }),

    // Pending payments
    Order.count({
      where: {
        payment_status: "PENDING",
        status: "PENDING_PAYMENT"
      }
    }),

    // Monthly expense
    Expense.sum("amount", {
      where: {
        expense_date: {
          [Op.gte]: startOfMonth,
          [Op.lt]: startOfNextMonth
        }
      }
    })
  ]);

  // =========================
  // FORMAT DAILY REVENUE
  // =========================

  const dailyRevenue = (dailyRevenueQuery as any[]).map(
    (row) => ({
      date: String(
        row.date ||
        today.toISOString().split("T")[0]
      ),

      revenue: Number(
        row.revenue || 0
      )
    })
  );

  // =========================
  // FORMAT MONTHLY REVENUE
  // =========================

  const monthlyRevenueData =
    (monthlyRevenueQuery as any[]).map(
      (row) => ({
        month: String(
          row.month || "unknown"
        ),

        revenue: Number(
          row.revenue || 0
        )
      })
    );

  // =========================
  // FORMAT ORDER COUNTS
  // =========================

  const orderCounts =
    (orderStatuses as any[]).map(
      (row) => ({
        status: String(
          row.status || "UNKNOWN"
        ),

        count: Number(
          row.count || 0
        )
      })
    );

  // =========================
  // FORMAT TOP PRODUCTS
  // =========================

  const topProducts =
    (topProductsQuery as any[]).map(
      (row) => ({
        name: String(
          row.name || "Unknown"
        ),

        totalSold: Number(
          row.totalSold || 0
        ),

        revenue: Number(
          row.revenue || 0
        )
      })
    );

  // =========================
  // FINAL RESULT
  // =========================

  const todayRevenue = Number(
    todayRevenueRes || 0
  );

  const monthlyRevenue = Number(
    monthlyRevenueRes || 0
  );

  const totalExpense = Number(
    totalExpenseRes || 0
  );

  return {
    todayRevenue,

    todayOrders: Number(
      todayOrdersRes || 0
    ),

    monthlyRevenue,

    totalCustomers: Number(
      totalCustomersRes || 0
    ),

    totalProducts: Number(
      totalProductsRes || 0
    ),

    lowStockProducts: Number(
      lowStockRes || 0
    ),

    pendingPayments: Number(
      pendingPaymentsRes || 0
    ),

    netProfit:
      monthlyRevenue - totalExpense,

    dailyRevenue,

    monthlyRevenueData,

    orderCounts,

    topProducts
  };
}

const dashboardService = {
  getDashboardData
};

export default dashboardService;






