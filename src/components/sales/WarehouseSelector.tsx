"use client";

/**
 * Warehouse Selector Component
 * Cho phép chọn kho xuất hàng khi tạo đơn hàng
 * Chỉ hiển thị: finished_product & goods warehouses
 */

import React, { useMemo } from "react";
import { useWarehouses } from "@/hooks/api";
import { Warehouse, ApiResponse } from "@/types";
import { Package, AlertCircle } from "lucide-react";
import { WAREHOUSE_TYPE_LABELS } from "@/lib/constants";

interface WarehouseSelectorProps {
  selectedWarehouseId: number | null;
  onSelect: (warehouseId: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  salesChannel?: "retail" | "wholesale" | "online" | "distributor";
}

export default function WarehouseSelector({
  selectedWarehouseId,
  onSelect,
  disabled = false,
  required = false,
  salesChannel = "retail",
}: WarehouseSelectorProps) {
  // Fetch warehouses - only finished_product & goods
  const { data, isLoading } = useWarehouses({ 
    limit: 100,
  });
  const response = data as unknown as ApiResponse<Warehouse[]>;
  const allWarehouses = response?.data || [];

  // Filter only saleable warehouses
  const availableWarehouses = useMemo(() => {
    return allWarehouses.filter(
      (w) => (w.warehouseType === "finished_product" || w.warehouseType === "goods") && 
             w.status === "active"
    );
  }, [allWarehouses]);

  const selectedWarehouse = useMemo(
    () => availableWarehouses.find((w) => w.id === selectedWarehouseId),
    [availableWarehouses, selectedWarehouseId]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Kho xuất hàng {required && <span className="text-red-500">*</span>}
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm text-gray-500">Đang tải...</span>
        </div>
      ) : availableWarehouses.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 dark:border-yellow-700 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-800 dark:text-yellow-300">
            Chưa có kho nào được kích hoạt
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {selectedWarehouse ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedWarehouse.warehouseName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {WAREHOUSE_TYPE_LABELS[selectedWarehouse.warehouseType]} • {selectedWarehouse.warehouseCode}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Thay đổi
                  </button>
                )}
              </div>
            </div>
          ) : (
            <select
              value=""
              onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Chọn kho xuất hàng --</option>
              {availableWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName} ({WAREHOUSE_TYPE_LABELS[warehouse.warehouseType]})
                </option>
              ))}
            </select>
          )}

          {required && !selectedWarehouseId && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Vui lòng chọn kho xuất hàng
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Hệ thống sẽ kiểm tra tồn kho tại kho này trước khi tạo đơn
          </p>
        </div>
      )}
    </div>
  );
}
