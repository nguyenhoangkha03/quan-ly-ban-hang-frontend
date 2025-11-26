import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, PaginationParams } from "@/types";

export interface UserQueryParams extends PaginationParams {
  roleId?: number;
  warehouseId?: number;
  status?: "active" | "inactive" | "locked";
}

/**
 * Query Keys
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

/**
 * Get Users List
 * For manager selector, typically call with status: "active"
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>("/users", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single User
 */
export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      return response;
    },
    enabled: enabled && !!id,
  });
}
