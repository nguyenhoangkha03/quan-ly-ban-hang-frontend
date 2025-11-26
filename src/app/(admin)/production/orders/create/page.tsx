"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProductionOrder,
  useBOMs,
  useWarehouses,
  useBOM,
} from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import { MaterialRequirements } from "@/components/features/production";
import {
  createProductionOrderSchema,
  type CreateProductionOrderInput,
} from "@/lib/validations";
import { ApiResponse, BOM, Warehouse, ProductionOrderMaterial, MaterialShortage } from "@/types";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

/**
 * Create Production Order Page
 * Tạo lệnh sản xuất mới
 */
export default function CreateProductionOrderPage() {
  const router = useRouter();
  const [selectedBOMId, setSelectedBOMId] = useState<number | null>(null);
  const [calculatedMaterials, setCalculatedMaterials] = useState<ProductionOrderMaterial[]>([]);
  const [materialShortages, setMaterialShortages] = useState<MaterialShortage[]>([]);

  // Fetch data
  const { data: bomsData } = useBOMs({ status: "active" });
  const bomsResponse = bomsData as unknown as ApiResponse<BOM[]>;
  const boms = bomsResponse?.data || [];

  const { data: warehousesData } = useWarehouses({ status: "active" });
  const warehousesResponse = warehousesData as unknown as ApiResponse<Warehouse[]>;
  const warehouses = warehousesResponse?.data || [];

  // Fetch selected BOM details
  const { data: bomData } = useBOM(selectedBOMId || 0, !!selectedBOMId);
  const bomResponse = bomData as unknown as ApiResponse<BOM>;
  const selectedBOM = bomResponse?.data;

  const createOrder = useCreateProductionOrder();

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductionOrderInput>({
    resolver: zodResolver(createProductionOrderSchema),
    defaultValues: {
      plannedQuantity: 1,
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  const watchBOMId = watch("bomId");
  const watchPlannedQuantity = watch("plannedQuantity");

  // Calculate materials when BOM or quantity changes
  useEffect(() => {
    if (selectedBOM && watchPlannedQuantity > 0) {
      calculateMaterials();
    } else {
      setCalculatedMaterials([]);
      setMaterialShortages([]);
    }
  }, [selectedBOM, watchPlannedQuantity]);

  // Handle BOM selection
  useEffect(() => {
    if (watchBOMId) {
      setSelectedBOMId(Number(watchBOMId));
    }
  }, [watchBOMId]);

  // Calculate material requirements
  const calculateMaterials = () => {
    if (!selectedBOM || !watchPlannedQuantity) return;

    const materials: ProductionOrderMaterial[] = selectedBOM.materials?.map((bomMaterial) => ({
      id: 0,
      productionOrderId: 0,
      materialId: bomMaterial.materialId,
      material: bomMaterial.material,
      plannedQuantity: bomMaterial.quantity * watchPlannedQuantity,
      actualQuantity: 0,
      wastage: 0,
      unitPrice: bomMaterial.material?.purchasePrice || 0,
      materialType: bomMaterial.materialType,
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) || [];

    setCalculatedMaterials(materials);

    // TODO: Check inventory to detect shortages
    // For now, just clear shortages
    setMaterialShortages([]);
  };

  // Handle form submit
  const onSubmit = async (data: CreateProductionOrderInput) => {
    try {
      const response = await createOrder.mutateAsync(data);

      // Check for material shortages warning
      if (response.warnings?.materialShortages) {
        const confirmed = window.confirm(
          `Cảnh báo: Thiếu ${response.warnings.materialShortages.length} nguyên liệu. ` +
          `Bạn có muốn tiếp tục? Cần nhập kho trước khi bắt đầu sản xuất.`
        );
        if (!confirmed) return;
      }

      router.push(`/production/orders/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create production order:", error);
    }
  };

  const totalCost = calculatedMaterials.reduce(
    (sum, m) => sum + m.plannedQuantity * m.unitPrice,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/production/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tạo Lệnh Sản Xuất
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo lệnh sản xuất mới từ công thức BOM
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thông tin cơ bản
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* BOM Selection */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Công thức sản xuất (BOM) <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("bomId", { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn công thức...</option>
                    {boms.map((bom) => (
                      <option key={bom.id} value={bom.id}>
                        {bom.bomCode} - {bom.finishedProduct?.productName} (v{bom.version})
                      </option>
                    ))}
                  </select>
                  {errors.bomId && (
                    <p className="mt-1 text-sm text-red-600">{errors.bomId.message}</p>
                  )}
                </div>

                {/* Selected Product Info */}
                {selectedBOM && (
                  <div className="sm:col-span-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Sản phẩm: {selectedBOM.finishedProduct?.productName}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      SKU: {selectedBOM.finishedProduct?.sku} | Đơn vị:{" "}
                      {selectedBOM.finishedProduct?.unit}
                    </p>
                  </div>
                )}

                {/* Planned Quantity */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số lượng kế hoạch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("plannedQuantity", { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.plannedQuantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.plannedQuantity.message}
                    </p>
                  )}
                </div>

                {/* Warehouse */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kho nhập thành phẩm
                  </label>
                  <select
                    {...register("warehouseId", { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn kho...</option>
                    {warehouses
                      .filter((w) => w.warehouseType === "finished_product")
                      .map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.warehouseName}
                        </option>
                      ))}
                  </select>
                  {errors.warehouseId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.warehouseId.message}
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ngày kết thúc (dự kiến)
                  </label>
                  <input
                    type="date"
                    {...register("endDate")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ghi chú
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Ghi chú thêm về lệnh sản xuất..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Material Requirements */}
            {calculatedMaterials.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Định mức nguyên liệu
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calculator className="h-4 w-4" />
                    <span>Tự động tính toán từ BOM</span>
                  </div>
                </div>

                <MaterialRequirements
                  materials={calculatedMaterials}
                  shortages={materialShortages}
                />
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Cost Summary */}
            {calculatedMaterials.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Tổng quan chi phí
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Chi phí nguyên liệu:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Tổng dự toán:
                      </span>
                      <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-xs text-blue-900 dark:text-blue-200">
                      Chi phí thực tế sẽ được tính khi hoàn thành sản xuất
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={createOrder.isPending || !selectedBOMId}
                  isLoading={createOrder.isPending}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Tạo lệnh sản xuất
                </Button>
                <Link href="/production/orders" className="block">
                  <Button variant="outline" className="w-full">
                    Hủy
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
