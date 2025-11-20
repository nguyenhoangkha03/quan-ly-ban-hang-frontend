/**
 * User & Role Types - Dựa trên database schema
 */

import type { BaseEntity, EntityWithUser, Status, UserStatus } from "./common.types";

// Role
export interface Role extends BaseEntity {
  role_key: string;
  role_name: string;
  description?: string;
  status: Status;
  permissions?: Permission[];
}

// Permission
export interface Permission extends BaseEntity {
  permission_key: string;
  permission_name: string;
  description?: string;
  module: string;
}

// User
export interface User extends EntityWithUser {
  employee_code: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  avatar_url?: string;
  role_id: number;
  role?: Role;
  warehouse_id?: number;
  warehouse?: Warehouse;
  status: UserStatus;
  last_login?: string;
}

// Warehouse (minimal for user relation)
export interface Warehouse {
  id: number;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_type: "raw_material" | "packaging" | "finished_product" | "goods";
}

// User Create DTO
export interface CreateUserDto {
  employee_code: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  role_id: number;
  warehouse_id?: number;
  status?: UserStatus;
}

// User Update DTO
export interface UpdateUserDto {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  date_of_birth?: string;
  role_id?: number;
  warehouse_id?: number;
  status?: UserStatus;
}

// Change Password DTO
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

// Login Response (với OTP)
export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// OTP Required Response
export interface OTPRequiredResponse {
  requireOTP: true;
  email: string;
  expiresIn: number;
  code?: string; // Only in development
}

// Verify OTP Request
export interface VerifyOTPRequest {
  email: string;
  code: string;
}

// Resend OTP Response
export interface ResendOTPResponse {
  expiresIn: number;
}

// Auth User (User hiện tại đang login)
export interface AuthUser extends User {
  permissions: string[];
}

// Activity Log
export interface ActivityLog extends BaseEntity {
  user_id: number;
  user?: User;
  action: "create" | "update" | "delete" | "approve";
  table_name: string;
  record_id: number;
  old_value?: any;
  new_value?: any;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  status: "success" | "failure";
}
