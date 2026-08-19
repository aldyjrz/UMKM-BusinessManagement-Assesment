import { User } from "@/types";

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const clearToken = (): void => {
  localStorage.removeItem("token");
};

export const requireRole = (allowedRoles: string[]): ((user: User | null) => boolean) => {
  return (user: User | null) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };
};

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const calculateSubtotal = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateTax = (subtotal: number, rate: number = 0.11): number => {
  return subtotal * rate;
};

export const calculateTotal = (subtotal: number, tax: number, discount: number = 0): number => {
  return subtotal + tax - discount;
};

