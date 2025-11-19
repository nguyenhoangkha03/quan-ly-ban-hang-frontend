import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores";
import type { LoginCredentials, LoginResponse, AuthUser, ApiResponse } from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * Login Mutation
 */
export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Lưu vào store
      login(data.user as AuthUser, data.accessToken, data.refreshToken);

      // Lưu vào cookie để middleware dùng
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400`; // 1 day

      toast.success("Đăng nhập thành công!");

      // Redirect về dashboard
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Đăng nhập thất bại!");
    },
  });
}

/**
 * Logout Mutation
 */
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      // Clear store
      logout();

      // Clear cookie
      document.cookie = "accessToken=; path=/; max-age=0";

      // Clear all queries
      queryClient.clear();

      toast.success("Đăng xuất thành công!");

      // Redirect về login
      router.push("/login");
    },
    onError: () => {
      // Vẫn logout local khi API fail
      logout();
      document.cookie = "accessToken=; path=/; max-age=0";
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Get Current User
 */
export function useMe() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<AuthUser>>("/auth/me");
      return response.data;
    },
    onSuccess: (data) => {
      // Update store với fresh user data
      setUser(data);
    },
    retry: false,
  });
}

/**
 * Forgot Password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<ApiResponse<void>>("/auth/forgot-password", {
        email,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Email khôi phục mật khẩu đã được gửi!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Gửi email thất bại!");
    },
  });
}

/**
 * Reset Password
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => {
      const response = await api.post<ApiResponse<void>>("/auth/reset-password", {
        token,
        password,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Đặt lại mật khẩu thất bại!");
    },
  });
}

/**
 * Change Password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      current_password,
      new_password,
    }: {
      current_password: string;
      new_password: string;
    }) => {
      const response = await api.post<ApiResponse<void>>("/auth/change-password", {
        current_password,
        new_password,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Đổi mật khẩu thất bại!");
    },
  });
}
