import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProductListPage from "@/pages/sales/ProductListPage";
import ProductDetailPage from "@/pages/sales/ProductDetailPage";
import CartPage from "@/pages/sales/CartPage";
import CheckoutPage from "@/pages/sales/CheckoutPage";
import CheckoutCompletePage from "@/pages/sales/CheckoutCompletePage";
import OrderStatusPage from "@/pages/sales/OrderStatusPage";
import MyOrdersPage from "@/pages/customer/MyOrdersPage";
import CustomerOrdersPage from "@/pages/customer/CustomerOrdersPage";
import AuthCallbackPage from "@/pages/AuthCallback";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductManagementPage from "@/pages/inventory/ProductManagementPage";
import CustomerManagementPage from "@/pages/customer/CustomerManagementPage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import FinancePage from "@/pages/finance/FinancePage";
import AdminOrdersPage from "@/pages/sales/AdminOrdersPage";
import AdminOrderDetailPage from "@/pages/sales/AdminOrderDetailPage";
import Providers from "@/providers";

function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/complete" element={<CheckoutCompletePage />} />
          <Route path="checkout/payment/:orderNumber" element={<CheckoutCompletePage />} />
          <Route path="order-status/:orderNumber" element={<OrderStatusPage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="orders/:id" element={<CustomerOrdersPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomerManagementPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="sales" element={<ProductListPage />} />
        </Route>
      </Routes>
    </Providers>
  );
}

export default App;

