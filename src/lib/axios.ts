import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "./constants";
import { useAuthStore } from "@/stores";

/**
 * Axios instance với interceptors cho authentication và error handling
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Để gửi cookies (cho refresh token)
});

/**
 * Request interceptor - Thêm authorization token vào mỗi request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ Zustand store (theo ROADMAP Phase 0.2)
    // Dùng getState() để đọc trực tiếp từ store, không phải từ localStorage
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Xử lý errors và refresh token
 */
api.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp từ response
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Token expired
    // KHÔNG redirect nếu đang ở trang login (đăng nhập sai)
    const isLoginRequest = originalRequest.url?.includes("/auth/login");

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token (đọc từ Zustand store)
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Dùng axios thô để tránh vòng lặp interceptor
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Response structure: { data: { success, data: { accessToken, expiresIn }, timestamp } }
        const newAccessToken = response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        // Backend chỉ trả về accessToken mới, KHÔNG trả refreshToken mới
        // Nên giữ nguyên refreshToken cũ để tránh ghi đè thành undefined
        const newRefreshToken = response.data?.data?.refreshToken || refreshToken;

        // Lưu token mới vào Zustand store (sẽ tự động sync vào localStorage)
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Retry request gốc với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại -> Logout user
        useAuthStore.getState().logout();

        // Chỉ redirect nếu không phải đang ở trang login và chưa bị redirect
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/login") && !currentPath.includes("/forgot-password")) {
            // Redirect với query param để tránh loop
            const redirectUrl = encodeURIComponent(currentPath);
            window.location.href = `/login?redirect=${redirectUrl}`;
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data || error.message || "Đã xảy ra lỗi";

    return Promise.reject(errorMessage);
  }
);

export default api;
