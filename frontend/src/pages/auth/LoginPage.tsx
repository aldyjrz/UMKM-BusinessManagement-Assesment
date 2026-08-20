import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => authService.login(data),
    onSuccess: (data) => {
      showToast("Login successful", "success");
      const role = data.user?.role;
      if ( role === "admin" ) {
        navigate("/admin");
      } else {
        navigate("/my-orders");
      }
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Login failed", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-800">Staff Login</h1>
          <p className="mt-2 text-sm text-neutral-600">Login to access the UMKM MANAGEMENT dashboard</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm border border-neutral-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
            <Button
              type="submit"
              fullWidth
               isLoading={loginMutation.isPending}
            >
              Login
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => authService.googleLogin()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 48 48">
                <path fill="#FF6B35" d="M24 9.5c3.54 0 6.31 1.22 8.42 3.6l6.16-6.16C33.67 2.28 29.12 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.18 5.66C11.49 12.72 17.23 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.43 24.55c0-1.75-.16-3.43-.43-5.08H24v9.73h12.92c-.58 2.57-2.26 4.74-4.78 6.28l7.18 5.66C42.71 35.89 46.43 29.97 46.43 24.55z" />
              </svg>
              Login with Google
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:text-primary-700">
              Register
            </Link>
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            <Link to="/" className="text-neutral-600 hover:text-neutral-800">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

