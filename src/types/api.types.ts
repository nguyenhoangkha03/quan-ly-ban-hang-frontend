/**
 * API Types - Định nghĩa types cho API requests/responses
 */

import type { ApiResponse, PaginationParams } from "./common.types";

// Generic List Response
export type ListResponse<T> = ApiResponse<T[]>;

// Generic Detail Response
export type DetailResponse<T> = ApiResponse<T>;

// Generic Create Response
export type CreateResponse<T> = ApiResponse<T>;

// Generic Update Response
export type UpdateResponse<T> = ApiResponse<T>;

// Generic Delete Response
export type DeleteResponse = ApiResponse<{ id: number; deleted: boolean }>;

// Generic List Query Params
export interface ListQueryParams extends PaginationParams {
  filters?: Record<string, any>;
  include?: string[];
}

// Bulk Operation
export interface BulkOperation<T = any> {
  ids: number[];
  action: string;
  data?: T;
}

// Bulk Response
export interface BulkResponse {
  success: number;
  failed: number;
  errors?: Array<{
    id: number;
    error: string;
  }>;
}

// Approval Request
export interface ApprovalRequest {
  reason?: string;
  notes?: string;
}

// Approval Response
export interface ApprovalResponse {
  id: number;
  approved_by: number;
  approved_at: string;
  status: string;
}
