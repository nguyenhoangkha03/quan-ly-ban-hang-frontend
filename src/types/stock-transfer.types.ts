import { BaseEntity } from "./common.types";
import { Product } from "./product.types";
import { TransferStatus } from "./stock-transaction.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";

// Stock Transfer
export interface StockTransfer extends BaseEntity {
  transferCode: string;
  fromWarehouseId: number;
  fromWarehouse?: Warehouse;
  toWarehouseId: number;
  toWarehouse?: Warehouse;
  transferDate: string;
  totalValue?: number;
  reason?: string;
  status: TransferStatus;
  requestedBy?: number;
  requester?: User;
  approvedBy?: number;
  approver?: User;
  cancelledBy?: number;
  canceller?: User;
  approvedAt?: string;
  cancelledAt?: string;
  details?: StockTransferDetail[];
  createdBy?: number;
  updatedBy?: number;
}

// Stock Transfer Detail
export interface StockTransferDetail extends BaseEntity {
  transferId: number;
  transfer?: StockTransfer;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}
