import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, Role, Status } from "@/types";

/**
 * Role Filters
 */
export interface RoleFilters {
  status?: Status;
}

/**
 * Query Keys
 */
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters?: RoleFilters) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

/**
 * Get Roles List
 */
export function useRoles(filters?: RoleFilters) {
  return useQuery({
    queryKey: roleKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Role[]>>("/roles", {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Get Single Role
 */
export function useRole(id: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}
