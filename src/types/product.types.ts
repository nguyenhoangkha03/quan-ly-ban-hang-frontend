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
  categoryCode: string;
  categoryName: string;
  slug: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  description?: string;
  status: Status;
}

// Supplier
export interface Supplier extends EntityWithUser {
  supplierCode: string;
  supplierName: string;
  supplierType: "local" | "foreign";
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  notes?: string;
  status: Status;
}

// Product
export interface Product extends EntityWithUser {
  sku: string;
  slug: string;
  productName: string;
  productType: ProductType;
  packagingType?: PackagingType;
  categoryId?: number;
  category?: Category;
  supplierId?: number;
  supplier?: Supplier;
  unit: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  description?: string;
  purchasePrice?: number;
  sellingPriceRetail?: number;
  sellingPriceWholesale?: number;
  sellingPriceVip?: number;
  taxRate?: number;
  minStockLevel?: number;
  expiryDate?: string;
  status: Status;
  images?: ProductImage[];
}

// Product Image
export interface ProductImage extends BaseEntity {
  productId: number;
  imageUrl: string;
  imageType: "thumbnail" | "gallery" | "main";
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
  uploadedBy?: number;
}

// Product Create DTO
export interface CreateProductDto {
  sku?: string;
  productName: string;
  productType: ProductType;
  packagingType?: PackagingType;
  categoryId?: number;
  supplierId?: number;
  unit: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  description?: string;
  purchasePrice?: number;
  sellingPriceRetail?: number;
  sellingPriceWholesale?: number;
  sellingPriceVip?: number;
  taxRate?: number;
  minStockLevel?: number;
  expiryDate?: string;
  status?: Status;
}

// Product Update DTO
export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Product Filters
export interface ProductFilters {
  productType?: ProductType | ProductType[];
  packagingType?: PackagingType;
  categoryId?: number;
  supplierId?: number;
  status?: Status;
  lowStock?: boolean;
  expiringSoon?: boolean;
  priceMin?: number;
  priceMax?: number;
}

// Product với tồn kho
export interface ProductWithInventory extends Product {
  totalQuantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
}

// Category Tree
export interface CategoryTree extends Category {
  level?: number;
  children?: CategoryTree[];
}
