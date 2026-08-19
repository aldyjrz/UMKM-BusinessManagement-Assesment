import api from "./api";
import type { Product, Customer, Order, Payment, Category, Supplier } from "@/types";

export const productService = {
  getAll: async (params?: { status?: string; categoryId?: number; search?: string; lowStock?: boolean }): Promise<Product[]> => {
    const response = await api.get("/products", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post("/products", product);
    return response.data.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data.data;
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get("/suppliers");
    return response.data.data;
  }
};

export const customerService = {
  getAll: async (params?: { type?: string; active?: boolean }): Promise<Customer[]> => {
    const response = await api.get("/customers", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },

  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.post("/customers", customer);
    return response.data.data;
  },

  update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  }
};

export const orderService = {
  createGuestOrder: async (data: {
    customer: { name: string; email: string; phone: string; address: string; city: string; postal_code: string };
    items: { product_id: number; quantity: number }[];
    notes?: string;
  }): Promise<{ order: Order; payment: Payment }> => {
    const response = await api.post("/orders/guest", data);
    return response.data.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  getByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get(`/orders/status/${orderNumber}`);
    return response.data.data;
  },

  getStatus: async (orderNumber: string, token: string): Promise<Order> => {
    const response = await api.get(`/orders/status/${orderNumber}`, { params: { token } });
    return response.data.data;
  },

  getPaymentByOrderId: async (orderId: number): Promise<Payment> => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/my-orders");
    return response.data.data;
  },

  getAll: async (params?: { status?: string; limit?: number; offset?: number }): Promise<Order[]> => {
    const response = await api.get("/orders", { params });
    return response.data.data;
  },

  getStats: async (): Promise<{ total: number; pending: number; paid: number }> => {
    const response = await api.get("/orders/stats");
    return response.data.data;
  },

  updateStatus: async (id: number, data: { status?: string; payment_status?: string }): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data.data;
  }
};

export const paymentService = {
  getById: async (id: number): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  }
};

export const dashboardService = {
  getDashboardData: async (): Promise<any> => {
    const response = await api.get("/dashboard");
    return response.data.data;
  }
};

export const financeService = {
  getSummary: async (): Promise<any> => {
    const response = await api.get("/finance/summary");
    return response.data.data;
  },

  getIncomes: async (params?: any): Promise<any[]> => {
    const response = await api.get("/finance/incomes", { params });
    return response.data.data;
  },

  getExpenses: async (params?: any): Promise<any[]> => {
    const response = await api.get("/finance/expenses", { params });
    return response.data.data;
  },

  createExpense: async (data: any): Promise<any> => {
    const response = await api.post("/finance/expenses", data);
    return response.data.data;
  }
};

export const inventoryService = {
  getSummary: async (): Promise<any> => {
    const response = await api.get("/inventory/summary");
    return response.data.data;
  },

  getMovements: async (params?: any): Promise<any[]> => {
    const response = await api.get("/inventory/stock-movements", { params });
    return response.data.data;
  },

  createPurchase: async (data: any): Promise<any> => {
    const response = await api.post("/inventory/purchase", data);
    return response.data.data;
  },

  createAdjustment: async (data: any): Promise<any> => {
    const response = await api.post("/inventory/adjustment", data);
    return response.data.data;
  }
};


