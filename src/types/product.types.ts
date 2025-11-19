/**
 * Product Types - Dựa trên database schema
 */

import type { BaseEntity, EntityWithUser, Status } from "./common.types";

// Product Type
export type ProductType = "raw_material" | "packaging" | "finished_product" | "goods";

// Packaging Type
export type PackagingType = "bottle" | "box" | "bag" | "label" | "other";

// Category
export interface Category extends BaseEntity {
  category_code: string;
  category_name: string;
  slug: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
  description?: string;
  status: Status;
}

// Supplier
export interface Supplier extends EntityWithUser {
  supplier_code: string;
  supplier_name: string;
  supplier_type: "local" | "foreign";
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  payment_terms?: string;
  notes?: string;
  status: Status;
}

// Product
export interface Product extends EntityWithUser {
  sku: string;
  slug: string;
  product_name: string;
  product_type: ProductType;
  packaging_type?: PackagingType;
  category_id?: number;
  category?: Category;
  supplier_id?: number;
  supplier?: Supplier;
  unit: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  description?: string;
  purchase_price?: number;
  selling_price_retail?: number;
  selling_price_wholesale?: number;
  selling_price_vip?: number;
  tax_rate?: number;
  min_stock_level?: number;
  expiry_date?: string;
  status: Status;
  images?: ProductImage[];
}

// Product Image
export interface ProductImage extends BaseEntity {
  product_id: number;
  image_url: string;
  image_type: "thumbnail" | "gallery" | "main";
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  uploaded_by?: number;
}

// Product Create DTO
export interface CreateProductDto {
  sku?: string;
  product_name: string;
  product_type: ProductType;
  packaging_type?: PackagingType;
  category_id?: number;
  supplier_id?: number;
  unit: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  description?: string;
  purchase_price?: number;
  selling_price_retail?: number;
  selling_price_wholesale?: number;
  selling_price_vip?: number;
  tax_rate?: number;
  min_stock_level?: number;
  expiry_date?: string;
  status?: Status;
}

// Product Update DTO
export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Product Filters
export interface ProductFilters {
  product_type?: ProductType | ProductType[];
  packaging_type?: PackagingType;
  category_id?: number;
  supplier_id?: number;
  status?: Status;
  low_stock?: boolean;
  expiring_soon?: boolean;
  price_min?: number;
  price_max?: number;
}

// Product với tồn kho
export interface ProductWithInventory extends Product {
  total_quantity?: number;
  available_quantity?: number;
  reserved_quantity?: number;
}

// Category Tree
export interface CategoryTree extends Category {
  level?: number;
  children?: CategoryTree[];
}
