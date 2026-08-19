import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/services/authService";
import api from "@/services/api";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Ambil data user untuk mengecek role
      authService.me().then((user) => {
        if (user) {
          showToast("Login successful", "success");
          const role = user.role;
          if ( role === "admin"  ) {
            navigate("/admin");
          } else {
            navigate("/my-orders");
          }
        } else {
          showToast("Failed to retrieve user profile", "error");
          navigate("/login");
        }
      }).catch(() => {
        showToast("Failed to retrieve user profile", "error");
        navigate("/login");
      });
    } else {
      showToast("Login failed", "error");
      navigate("/login");
    }
  }, [location, navigate, showToast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600"></div>
        <p className="mt-4 text-neutral-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

