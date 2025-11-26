"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSalesOrder } from "@/hooks/api";
import { useOrderCart } from "@/hooks/useOrderCart";
import CustomerSelector from "@/components/features/sales/CustomerSelector";
import ProductCart from "@/components/features/sales/ProductCart";
import OrderSummary from "@/components/features/sales/OrderSummary";
import Button from "@/components/ui/button/Button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Customer, PaymentMethod, SalesChannel, CreateSalesOrderDto } from "@/types";
import { SALES_CHANNEL_LABELS } from "@/lib/constants";

/**
 * Create Sales Order Page
 * Multi-step wizard để tạo đơn hàng bán
 */
export default function CreateSalesOrderPage() {
  const router = useRouter();
  const createOrder = useCreateSalesOrder();

  // State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [salesChannel, setSalesChannel] = useState<SalesChannel>("retail");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  // Cart hook
  const cart = useOrderCart({ shippingFee });

  // Validation
  const canSubmit = selectedCustomer && cart.items.length > 0;

  // Check credit limit
  const debtAmount = cart.summary.total - paidAmount;
  const availableCredit = selectedCustomer
    ? Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentDebt)
    : 0;
  const willExceedLimit =
    paymentMethod === "credit" && selectedCustomer && debtAmount > availableCredit;

  // Handle Submit
  const handleSubmit = async () => {
    if (!canSubmit || !selectedCustomer) return;

    // Validate credit limit
    if (willExceedLimit) {
      alert(
        "Đơn hàng vượt hạn mức công nợ của khách hàng. Vui lòng tăng số tiền trả trước hoặc thay đổi phương thức thanh toán."
      );
      return;
    }

    const data: CreateSalesOrderDto = {
      customerId: selectedCustomer.id,
      salesChannel,
      deliveryAddress: deliveryAddress || undefined,
      shippingFee,
      paymentMethod,
      paidAmount: paymentMethod === "credit" ? paidAmount : cart.summary.total,
      notes: notes || undefined,
      details: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        taxRate: item.taxRate,
      })),
    };

    try {
      const response = await createOrder.mutateAsync(data);
      cart.clearCart();
      router.push(`/sales/orders/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create sales order:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Link href="/sales/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tạo Đơn Hàng Mới
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chọn khách hàng, thêm sản phẩm và hoàn tất đơn hàng
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer Selection */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              1. Chọn khách hàng
            </h2>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelect={setSelectedCustomer}
            />
          </div>

          {/* Step 2: Order Items */}
          {selectedCustomer && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                2. Thêm sản phẩm
              </h2>
              <ProductCart
                items={cart.items}
                onAddItem={cart.addItem}
                onRemoveItem={cart.removeItem}
                onUpdateQuantity={cart.updateQuantity}
                onUpdatePrice={cart.updatePrice}
                onUpdateDiscount={cart.updateDiscount}
                onUpdateTax={cart.updateTax}
              />
            </div>
          )}

          {/* Step 3: Order Details */}
          {selectedCustomer && cart.items.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                3. Thông tin đơn hàng
              </h2>

              <div className="space-y-4">
                {/* Sales Channel */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kênh bán hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={salesChannel}
                    onChange={(e) => setSalesChannel(e.target.value as SalesChannel)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="retail">{SALES_CHANNEL_LABELS.retail}</option>
                    <option value="wholesale">{SALES_CHANNEL_LABELS.wholesale}</option>
                    <option value="online">{SALES_CHANNEL_LABELS.online}</option>
                    <option value="distributor">{SALES_CHANNEL_LABELS.distributor}</option>
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Địa chỉ giao hàng
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={selectedCustomer.address || "Nhập địa chỉ giao hàng..."}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Shipping Fee */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phí vận chuyển (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1000"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú về đơn hàng..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedCustomer && cart.items.length > 0 && (
            <div className="flex justify-end gap-3">
              <Link href="/sales/orders">
                <Button variant="outline">Hủy</Button>
              </Link>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canSubmit || willExceedLimit || createOrder.isPending}
              >
                <Save className="mr-2 h-5 w-5" />
                {createOrder.isPending ? "Đang tạo..." : "Tạo đơn hàng"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary (Sticky) */}
        {selectedCustomer && cart.items.length > 0 && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OrderSummary
                summary={cart.summary}
                paymentMethod={paymentMethod}
                paidAmount={paidAmount}
                customer={selectedCustomer}
                onPaymentMethodChange={setPaymentMethod}
                onPaidAmountChange={setPaidAmount}
              />
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!selectedCustomer && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 Bắt đầu bằng cách chọn khách hàng để tạo đơn hàng
          </p>
        </div>
      )}

      {selectedCustomer && cart.items.length === 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-900 dark:text-yellow-300">
            💡 Tìm kiếm và thêm sản phẩm vào đơn hàng
          </p>
        </div>
      )}
    </div>
  );
}
