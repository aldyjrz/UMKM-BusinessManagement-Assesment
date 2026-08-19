import api from "./api";
import type { LoginCredentials, RegisterData, User } from "@/types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post("/auth/login", credentials);
    const { data } = response;
    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.data.token}`;
    }
    return data.data;
  },

  register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await api.post("/auth/register", userData);
    const { data } = response;
    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.data.token}`;
    }
    return data.data;
  },

  googleLogin: (): void => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/google`;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  },

  me: async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await api.get("/auth/me");
      return response.data.data as User;
    } catch {
      return null;
    }
  }
};

