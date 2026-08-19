export type UserRole = "customer" |  "admin"  ;

export interface User {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin" ;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface Customer {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  type: "GUEST" | "REGISTERED";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  stock: number;
  minimum_stock: number;
  category_id: number | null;
  supplier_id: number | null;
  image: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  secure_token: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  payment_gateway: string;
  gateway_transaction_id: string | null;
  snap_token: string | null;
  redirect_url: string | null;
  created_at: string;
    gateway_response?: string | null;

  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Income {
  id: number;
  order_id: number;
  amount: number;
  description: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  categories: number;
  suppliers: number;
  totalMovements: number;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  todayRevenue: number;
  todayExpense: number;
  monthlyRevenue: number;
  monthlyExpense: number;
}

export interface DashboardData {
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
  topProducts: Array<{ name: string; totalSold: number; revenue: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
}

