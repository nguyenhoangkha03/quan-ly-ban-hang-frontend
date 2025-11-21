import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, PaginationParams } from "@/types";

/**
 * User Type
 */
export interface User {
  id: number;
  employeeCode: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  avatarUrl?: string;
  roleId: number;
  warehouseId?: number;
  status: "active" | "inactive" | "locked";
  role?: {
    id: number;
    roleKey: string;
    roleName: string;
  };
  warehouse?: {
    id: number;
    warehouseCode: string;
    warehouseName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query Params for Users
 */
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
