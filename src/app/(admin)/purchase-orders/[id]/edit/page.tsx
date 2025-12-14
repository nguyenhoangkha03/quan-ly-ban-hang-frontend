"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useSuppliers,
  useWarehouses,
  useProducts,
  usePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { ProductSelector } from "@/components/inventory";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Lock } from "lucide-react";
import type { Product, Supplier, Warehouse, PurchaseOrder } from "@/types";
import {
  updatePurchaseOrderSchema,
  type UpdatePurchaseOrderFormData,
  type purchaseOrderDetailSchemaType,
} from "@/lib/validations/purchase-order.schema";
import { Decimal } from "decimal.js";
import { toast } from "react-hot-toast";
import { convertWarehouseType } from "@/lib/warehouse";

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = parseInt(params.id as string);

  const { data: poResponse, isLoading: poLoading } = usePurchaseOrder(poId);
  const { data: suppliersResponse } = useSuppliers();
  const { data: warehousesResponse } = useWarehouses();
  const { data: productsResponse } = useProducts();
  const updatePO = useUpdatePurchaseOrder();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const po = poResponse?.data as unknown as PurchaseOrder | undefined;
  const suppliers = (suppliersResponse?.data as unknown as Supplier[]) || [];
  const warehouses = (warehousesResponse?.data as unknown as Warehouse[]) || [];
  const allProducts = (productsResponse?.data as unknown as Product[]) || [];

  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updatePurchaseOrderSchema),
    defaultValues: {
      details: [],
      taxRate: 0,
      orderDate: new Date().toISOString().split("T")[0],
    },
  });

  // Pre-fill form when PO data loads
  useEffect(() => {
    if (po) {
      setValue("supplierId", po.supplierId);
      setValue("warehouseId", po.warehouseId);
      setValue("orderDate", po.orderDate.split("T")[0]);
      if (po.expectedDeliveryDate) {
        setValue("expectedDeliveryDate", po.expectedDeliveryDate.split("T")[0]);
      }
      setValue("taxRate", po.taxRate);
      setValue("notes", po.notes);

      // Pre-fill details
      const details = po.details?.map((d: any) => ({
        id: d.id,
        productId: d.productId,
        quantity: Number(d.quantity),
        unitPrice: Number(d.unitPrice),
        notes: d.notes || "",
      })) || [];
      setValue("details", details);
    }
  }, [po, setValue]);

  const details = watch("details") as purchaseOrderDetailSchemaType[];
  const taxRate = watch("taxRate");
  const supplierId = watch("supplierId");
  const warehouseId = watch("warehouseId");

  // Check if can edit (only pending status)
  const canEdit = po?.status === "pending";

  const handleAddProduct = (productId: number) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Check if product already added
    if (details.some((d) => d.productId === productId)) {
      toast.error("Sản phẩm này đã được thêm vào");
      return;
    }

    const newDetail: purchaseOrderDetailSchemaType = {
      productId,
      quantity: 1,
      unitPrice: product.purchasePrice
        ? new Decimal(product.purchasePrice).toNumber()
        : 0,
      notes: "",
    };

    setValue("details", [...details, newDetail]);
  };

  const handleRemoveItem = (index: number) => {
    setValue(
      "details",
      details.filter((_, i) => i !== index)
    );
  };

  const handleUpdateItem = (index: number, updates: any) => {
    const updated = [...details];
    updated[index] = { ...updated[index], ...updates };
    setValue("details", updated);
  };

  const totals = details.reduce(
    (acc, item) => {
      const qty = new Decimal(item.quantity || 0);
      const price = new Decimal(item.unitPrice || 0);
      const itemTotal = qty.mul(price);

      return {
        quantity: acc.quantity.add(qty),
        total: acc.total.add(itemTotal),
      };
    },
    {
      quantity: new Decimal(0),
      total: new Decimal(0),
    }
  );

  const totalWithTax = totals.total.mul(1 + (taxRate || 0) / 100);

  const onSubmit = async (data: UpdatePurchaseOrderFormData) => {
    try {
      await updatePO.mutateAsync({
        id: poId,
        data,
      });
      router.push(`/purchase-orders/${poId}`);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    handleSubmit(onSubmit)();
  };

  if (poLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/30">
        <p className="text-red-700 dark:text-red-300">Không tìm thấy đơn đặt hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cập nhật đơn đặt hàng
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Chỉnh sửa thông tin: {po.poCode}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>

      {/* Status Alert */}
      {!canEdit && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/30">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">
                ⛔ Không thể chỉnh sửa
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                Đơn hàng hiện tại ở trạng thái <strong>{po.status === "approved" ? "Đã duyệt" : po.status === "received" ? "Đã nhận hàng" : "Đã hủy"}</strong> nên không thể chỉnh sửa.
              </p>
              {po.status === "approved" && (
                <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                  💡 Để chỉnh sửa, bạn cần nút "Hủy duyệt" để đưa đơn về trạng thái chờ duyệt (hiện chưa có sẵn).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {canEdit && (
        <form
          onSubmit={handleSubmit((data) => {
            setShowConfirmDialog(true);
          })}
          className="space-y-6"
        >
          {/* Top Section - 2 Columns Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Warehouse & Supplier */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Thông tin cơ bản
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nhà cung cấp <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={suppliers.map((s) => ({
                        value: s.id,
                        label: s.supplierName,
                      }))}
                      value={watch("supplierId") || ""}
                      onChange={(value) => setValue("supplierId", Number(value))}
                      placeholder="Tìm kiếm nhà cung cấp..."
                    />
                    {errors.supplierId && (
                      <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
                    )}
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kho nhập <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={warehouses
                        .filter((w) =>
                          ["raw_material", "packaging", "finished_product", "goods"].includes(
                            w.warehouseType
                          )
                        )
                        .map((w) => ({
                          value: w.id,
                          label: `${w.warehouseName} (${convertWarehouseType(w.warehouseType)})`,
                        }))}
                      value={watch("warehouseId") || ""}
                      onChange={(value) => setValue("warehouseId", Number(value))}
                      placeholder="Tìm kiếm kho..."
                    />
                    {errors.warehouseId && (
                      <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
                    )}
                  </div>

                  {/* Order Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày đặt hàng <span className="text-red-500">*</span>
                    </label>
                    <FormDatePicker
                      name="orderDate"
                      control={control}
                      placeholder="Chọn ngày đặt hàng"
                      error={errors.orderDate?.message}
                    />
                  </div>

                  {/* Expected Delivery Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày giao dự kiến
                    </label>
                    <FormDatePicker
                      name="expectedDeliveryDate"
                      control={control}
                      placeholder="Chọn ngày giao dự kiến"
                    />
                  </div>
                </div>
              </div>

              {/* Add Products */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Chọn sản phẩm
                </h2>
                <ProductSelector
                  onSelect={(product) => handleAddProduct(product.id)}
                  excludeProductIds={details.map((d) => d.productId)}
                />
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Số sản phẩm:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {details.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số lượng:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {totals.quantity.toNumber()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tổng giá trị:
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(totals.total.toNumber())}
                      </span>
                    </div>
                  </div>

                  {/* Tax and Total After Tax */}
                  {taxRate != null && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Tiền thuế ({taxRate}%):
                        </span>
                        <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                          {formatCurrency(
                            totals.total.times(taxRate / 100).toNumber() || 0
                          )}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tổng thanh toán:
                          </span>
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(
                              totals.total.times(1 + taxRate / 100).toNumber()
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={details.length === 0}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Cập nhật đơn hàng
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

                {details.length === 0 && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Vui lòng thêm sản phẩm
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          {details.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Danh sách sản phẩm
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {details.length} sản phẩm
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Sản phẩm
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Số lượng
                        </th>
                        <th className="w-32 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Đơn giá
                        </th>
                        <th className="w-32 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Thành tiền
                        </th>
                        <th className="w-48 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Ghi chú
                        </th>
                        <th className="w-20 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((item, index) => {
                        const product = allProducts.find((p) => p.id === item.productId);
                        const price = new Decimal(item.unitPrice || 0);
                        const total = price.times(item.quantity);

                        return (
                          <tr
                            key={index}
                            className="border-b border-gray-200 dark:border-gray-700"
                          >
                            {/* Index */}
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>

                            {/* Product */}
                            <td className="px-4 py-3">
                              {product ? (
                                <div className="flex items-center gap-3">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={product.images[0].imageUrl}
                                      alt={product.productName}
                                      className="h-10 w-10 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                      <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {product.productName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {product.sku}
                                      {product.unit && ` • ${product.unit}`}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Sản phẩm không tồn tại
                                </div>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(index, {
                                    quantity: parseFloat(e.target.value) || 1,
                                  })
                                }
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              />
                            </td>

                            {/* Unit Price */}
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={price.toNumber()}
                                onChange={(e) =>
                                  handleUpdateItem(index, {
                                    unitPrice:
                                      new Decimal(e.target.value).toNumber() || 0,
                                  })
                                }
                                className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              />
                            </td>

                            {/* Total */}
                            <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                              {total.toNumber().toLocaleString("vi-VN")} ₫
                            </td>

                            {/* Notes */}
                            <td className="px-4 py-3">
                              <textarea
                                value={item.notes || ""}
                                onChange={(e) =>
                                  handleUpdateItem(index, {
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Ghi chú..."
                                rows={2}
                                className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 resize-none"
                              />
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Xóa"
                              >
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="mt-4 flex justify-end">
                    <div className="w-80 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Tổng số lượng:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {details
                            .reduce((sum, item) => sum + item.quantity, 0)
                            .toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Tổng giá trị:
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {totals.total.toNumber().toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary & Tax Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Tax Rate */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thuế suất
              </h2>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("taxRate", { valueAsNumber: true })}
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400">%</span>
              </div>
            </div>

            {/* Notes */}
            <div className="lg:col-span-3 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Ghi chú
              </h2>
              <textarea
                {...register("notes")}
                placeholder="Ghi chú thêm về đơn đặt hàng..."
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Xác nhận cập nhật"
        message={`Bạn có chắc chắn muốn cập nhật đơn đặt hàng với ${details.length} sản phẩm (tổng ${totals.quantity} đơn vị) không? Tổng giá trị: ${formatCurrency(totalWithTax.toNumber())}`}
        confirmText="Cập nhật"
        variant="info"
        isLoading={isSubmitting}
      />
    </div>
  );
}
