import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import type { User } from "@/types";

const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["auth.me"],
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await authService.login(credentials);
      queryClient.setQueryData(["auth.me"], result.user);
      return result;
    },
    [queryClient]
  );

  const register = useCallback(
    async (userData: { name: string; email: string; password: string; phone: string }) => {
      const result = await authService.register(userData);
      queryClient.setQueryData(["auth.me"], result.user);
      return result;
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    queryClient.setQueryData(["auth.me"], null);
    queryClient.clear();
  }, [queryClient]);

  const googleLogin = useCallback(() => {
    authService.googleLogin();
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin" ;
 
  return {
    user,
    isAuthenticated,
    isAdmin, 
    isLoading,
    login,
    register,
    logout,
    googleLogin,
    refetch
  };
};

export default useAuth;

