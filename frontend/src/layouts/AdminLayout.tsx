import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin"},
    { name: "Products", href: "/admin/products"},
    { name: "Inventory", href: "/admin/inventory"},
    { name: "Orders", href: "/admin/orders"},
    { name: "Customers", href: "/admin/customers"}, 
    { name: "Finance", href: "/admin/finance"}
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    navigate("/my-orders");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-shrink-0 flex-col overflow-y-auto bg-white shadow-sm border-r border-neutral-200 lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-neutral-200">
          <span className="text-xl font-bold text-primary-600">UMKM ERP Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                (location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href)))
                  ? "bg-primary-100 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
               {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center">
              {user?.name?.[0] || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">{user?.name || "Admin"}</p>
              <p className="text-xs text-neutral-500">{user?.role || "admin"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-800">
            {navigation.find((n) => n.href === location.pathname)?.name || "Admin Panel"}
          </h1>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


