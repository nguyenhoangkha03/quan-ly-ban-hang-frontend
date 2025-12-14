import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores";
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
  ApiResponse,
  OTPRequiredResponse,
  VerifyOTPRequest,
  ResendOTPResponse,
} from "@/types";
import { toast } from "react-hot-toast";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * Login Mutation (Step 1: Email + Password)
 * Returns either OTP required or direct login (tokens)
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post<ApiResponse<LoginResponse | OTPRequiredResponse>>(
        "/auth/login",
        credentials
      );
      return response.data;
    },
    onError: (error: any) => {
      // error có thể có nhiều cấu trúc:
      // - { error: { message: "..." } } - từ backend error handler
      // - { error: "..." } - từ backend simple error
      // - { message: "..." } - từ axios
      // - string - plain error
    //   console.log(error);
      const message =
        error?.error?.message ||
        error?.error ||
        error?.message ||
        (typeof error === 'string' ? error : null) ||
        "Đăng nhập thất bại!";

      toast.error(message);
    },
  });
}

/**
 * Verify OTP Mutation (Step 2: Verify OTP code)
 */
export function useVerifyOTP() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: VerifyOTPRequest) => {
      const response = await api.post<ApiResponse<LoginResponse>>(
        "/auth/verify-otp",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Backend trả về: { user, tokens: { accessToken, refreshToken } }
      const { user, tokens } = data;
      const { accessToken, refreshToken } = tokens;

      // Lưu vào store
      login(user as AuthUser, accessToken, refreshToken);

      // Lưu cookie
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

      toast.success("Xác thực thành công!");

      // Redirect về dashboard
      router.push("/");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message ||
        error?.error ||
        error?.message ||
        (typeof error === "string" ? error : null) ||
        "Mã xác thực không đúng!";

      toast.error(message);
    },
  });
}

/**
 * Resend OTP Mutation
 */
export function useResendOTP() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post<ApiResponse<ResendOTPResponse>>(
        "/auth/resend-otp",
        { email }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mã xác thực mới đã được gửi đến email của bạn!");
    },
    onError: (error: any) => {
      const message =
        error?.error?.message ||
        error?.error ||
        error?.message ||
        (typeof error === "string" ? error : null) ||
        "Không thể gửi lại mã xác thực!";

      toast.error(message);
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
  const { setUser, token } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<AuthUser>>("/auth/me");
      return response.data;
    },
    retry: false,
    enabled: !!token, // Chỉ fetch khi có token
  });

  // Update store khi có data (thay thế onSuccess đã bị loại bỏ trong v5)
  React.useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
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
      const message = error?.error || error?.message || error || "Gửi email thất bại!";
      toast.error(typeof message === 'string' ? message : "Gửi email thất bại!");
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
      const message = error?.error || error?.message || error || "Đặt lại mật khẩu thất bại!";
      toast.error(typeof message === 'string' ? message : "Đặt lại mật khẩu thất bại!");
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
      const message = error?.error || error?.message || error || "Đổi mật khẩu thất bại!";
      toast.error(typeof message === 'string' ? message : "Đổi mật khẩu thất bại!");
    },
  });
}
