import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/types";

// Auth State Interface
interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isRole: (roleKey: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // Set Hydrated
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Set User
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      // Set Tokens
      setTokens: (token, refreshToken) => {
        // Lưu vào localStorage để axios interceptor dùng
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ token, refreshToken });
      },

      // Login - Set user và tokens cùng lúc
      login: (user, token, refreshToken) => {
        // Lưu vào localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // Logout - Clear tất cả
      logout: () => {
        // Xóa localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Check Permission
      hasPermission: (permission) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },

      // Check Any Permission (có ít nhất 1 permission)
      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return permissions.some((p) => user.permissions.includes(p));
      },

      // Check All Permissions (có tất cả permissions)
      hasAllPermissions: (permissions) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return permissions.every((p) => user.permissions.includes(p));
      },

      // Check Role
      isRole: (roleKey) => {
        const { user } = get();
        return user?.role?.roleKey === roleKey;
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Sync cookie khi store được hydrate từ localStorage
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined" && state?.token) {
          // Kiểm tra cookie hiện tại
          const cookieToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1];

          // Nếu cookie không có hoặc khác với store token -> sync lại
          if (!cookieToken || cookieToken !== state.token) {
            document.cookie = `accessToken=${state.token}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
        // Mark as hydrated
        useAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);

// Hook để đợi hydration hoàn thành
export function useAuthHydration() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [isHydrated, setIsHydrated] = useState(hasHydrated);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
