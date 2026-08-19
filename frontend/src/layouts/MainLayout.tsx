import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { ShoppingCart } from "@/components/ui/icons";
import clsx from "clsx";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCartClick = () => {
    if (totalItems > 0) {
      navigate("/cart");
    } else {
      showToast("Your cart is empty", "info");
    }
  };

  
  const handleMyOrder = () => {
    
      navigate("/my-orders");
    
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-neutral-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-primary-600">
          UMKM ERP
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            to="/products"
            className={clsx(
              "text-sm font-medium transition-colors",
              location.pathname === "/products" ? "text-primary-600" : "text-neutral-600 hover:text-neutral-800"
            )}
          >
            Products
          </Link>

          <button
            onClick={handleCartClick}
            className="relative p-1 text-neutral-600 hover:text-primary-600 transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center px-1 text-xs"
              >
                {totalItems}
              </Badge>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span onClick={handleMyOrder} className="text-sm font-medium text-neutral-700">
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
