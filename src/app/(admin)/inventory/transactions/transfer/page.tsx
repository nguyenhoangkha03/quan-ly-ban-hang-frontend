"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWarehouses, useProducts, useCreateTransferTransaction } from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import { ProductSelector } from "@/components/inventory/ProductSelector";
import { TransactionItems } from "@/components/inventory/TransactionItems";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const transferSchema = z.object({
  sourceWarehouseId: z.number().int().positive("Vui lòng chọn kho nguồn"),
  destinationWarehouseId: z.number().int().positive("Vui lòng chọn kho đích"),
  reason: z.string().optional().default("Chuyển kho"),
  notes: z.string().optional(),
  details: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().positive("Số lượng phải > 0"),
        unitPrice: z.number().nonnegative().optional(),
        batchNumber: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, "Phải thêm ít nhất 1 sản phẩm"),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function TransferTransactionPage() {
  const router = useRouter();
  const { data: warehousesResponse } = useWarehouses();
  const { data: productsResponse } = useProducts();
  const createTransfer = useCreateTransferTransaction();

  const warehouses = warehousesResponse?.data || [];
  const allProducts = productsResponse?.data || [];

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      details: [],
      reason: "Chuyển kho",
    },
  });

  const details = watch("details");
  const sourceWarehouse = watch("sourceWarehouseId");
  const destinationWarehouse = watch("destinationWarehouseId");

  const handleAddProduct = (productId: number) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    setValue("details", [...details, {
      productId,
      quantity: 1,
      unitPrice: product.purchasePrice || 0,
      batchNumber: "",
      notes: "",
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setValue("details", details.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...details];
    updated[index] = { ...updated[index], [field]: value };
    setValue("details", updated);
  };

  const totals = details.reduce(
    (acc, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return {
        quantity: acc.quantity + (item.quantity || 0),
        total: acc.total + itemTotal,
      };
    },
    { quantity: 0, total: 0 }
  );

  const onSubmit = async (data: TransferFormData) => {
    try {
      await createTransfer.mutateAsync(data);
      router.push("/inventory/transactions");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tạo phiếu chuyển kho
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Chuyển hàng giữa các kho trong hệ thống
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Thông tin kho</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kho nguồn *
                  </label>
                  <select
                    {...register("sourceWarehouseId", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id} disabled={w.id === destinationWarehouse}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                  {errors.sourceWarehouseId && (
                    <p className="mt-1 text-sm text-red-600">{errors.sourceWarehouseId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kho đích *
                  </label>
                  <select
                    {...register("destinationWarehouseId", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id} disabled={w.id === sourceWarehouse}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                  {errors.destinationWarehouseId && (
                    <p className="mt-1 text-sm text-red-600">{errors.destinationWarehouseId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {sourceWarehouse && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold">Chọn sản phẩm</h2>
                <ProductSelector
                  products={allProducts}
                  onSelectProduct={handleAddProduct}
                  selectedProductIds={details.map((d) => d.productId)}
                />
              </div>
            )}

            {details.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold">Danh sách ({details.length})</h2>
                <TransactionItems
                  items={details}
                  products={allProducts}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateItem}
                  showPriceFields={false}
                  showBatchExpiry={false}
                />
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold">Thông tin bổ sung</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  {...register("reason")}
                  placeholder="VD: Cân bằng tồn kho"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
                <textarea
                  {...register("notes")}
                  placeholder="Ghi chú..."
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold">Tóm tắt</h3>
              <div className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Số lượng:</span>
                  <span className="font-semibold">{totals.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tổng:</span>
                  <span className="font-semibold">{formatCurrency(totals.total)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting || details.length === 0}
                  isLoading={isSubmitting}
                >
                  Tạo phiếu
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
