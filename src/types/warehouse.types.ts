import { BaseEntity, StatusCommon } from "./common.types";
import { User } from "./user.types";

export type WarehouseType = "raw_material" | "packaging" | "finished_product" | "goods";

export interface Warehouse extends BaseEntity {
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  address?: string;
  city?: string;
  region?: string;
  description?: string;
  managerId?: number;
  manager?: User;
  capacity?: number;
  status: StatusCommon;
}

export interface WarehouseFilters {
  warehouseType?: WarehouseType;
  status?: StatusCommon;
  city?: string;
  region?: string;
  managerId?: number;
}