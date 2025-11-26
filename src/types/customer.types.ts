/**
 * Customer Types - Dựa trên database schema
 */

import type { BaseEntity, Status } from "./common.types";

// Customer Type
export type CustomerType = "individual" | "company";

// Customer Classification
export type CustomerClassification = "retail" | "wholesale" | "vip" | "distributor";

// Customer
export interface Customer extends BaseEntity {
  customer_code: string;
  customer_name: string;
  customer_type: CustomerType;
  classification: CustomerClassification;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  tax_code?: string;
  credit_limit: number;
  current_debt: number;
  notes?: string;
  status: Status;
  created_by?: number;
  updated_by?: number;
}

// Create Customer DTO
export interface CreateCustomerDto {
  customer_name: string;
  customer_type: CustomerType;
  classification: CustomerClassification;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  tax_code?: string;
  credit_limit?: number;
  notes?: string;
  status?: Status;
}

// Update Customer DTO
export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// Customer Filters
export interface CustomerFilters {
  customer_type?: CustomerType;
  classification?: CustomerClassification;
  city?: string;
  region?: string;
  status?: Status;
  has_debt?: boolean;
  debt_overdue?: boolean;
}

// Customer with Debt Info
export interface CustomerWithDebt extends Customer {
  total_orders?: number;
  total_revenue?: number;
  last_order_date?: string;
  debt_percentage?: number; // (current_debt / credit_limit) * 100
}

// Debt History
export interface DebtHistory extends BaseEntity {
  customer_id: number;
  customer?: Customer;
  transaction_type: "order" | "payment" | "adjustment";
  reference_id?: number;
  amount: number;
  balance_before: number;
  balance_after: number;
  notes?: string;
}
