import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * useAuth Hook
 * Hook tổng hợp để quản lý authentication
 *
 * @returns Object chứa auth state và actions
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();

  // Logout và redirect về login
  const logout = useCallback(() => {
    authStore.logout();
    router.push("/login");
  }, [authStore, router]);

  // Check nếu chưa login thì redirect về login
  const requireAuth = useCallback(() => {
    if (!authStore.isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  }, [authStore.isAuthenticated, router]);

  // Check nếu đã login thì redirect về dashboard
  const redirectIfAuthenticated = useCallback(() => {
    if (authStore.isAuthenticated) {
      router.push("/dashboard");
      return true;
    }
    return false;
  }, [authStore.isAuthenticated, router]);

  return {
    // State
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,

    // Actions
    login: authStore.login,
    logout,
    setUser: authStore.setUser,
    setTokens: authStore.setTokens,

    // Permissions
    hasPermission: authStore.hasPermission,
    hasAnyPermission: authStore.hasAnyPermission,
    hasAllPermissions: authStore.hasAllPermissions,
    isRole: authStore.isRole,

    // Helpers
    requireAuth,
    redirectIfAuthenticated,
  };
}
