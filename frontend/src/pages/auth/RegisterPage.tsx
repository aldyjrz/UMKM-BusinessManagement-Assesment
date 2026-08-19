import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const registerMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone: string }) => authService.register(data),
    onSuccess: () => {
       showToast("Registration successful", "success");
       navigate("/login");
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || "Registration failed", "error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password, phone });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-800">Register</h1>
          <p className="mt-2 text-sm text-neutral-600">Create your account</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm border border-neutral-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+628xx" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required minLength={6} />
            <Button type="submit" fullWidth isLoading={registerMutation.isPending}>
              Register
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:text-primary-700">
              Login
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

export default RegisterPage;

