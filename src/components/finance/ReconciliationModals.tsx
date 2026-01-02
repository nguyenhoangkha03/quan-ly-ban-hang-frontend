"use client";

import React from "react";
import { useDebtReconciliationStore } from "@/stores/debtReconciliationStore";
import { 
  useSyncDebtReconciliation, 
  useSendReconciliationEmail, 
  useDebtReconciliation 
} from "@/hooks/api/useDebtReconciliation";
import { Modal } from "@/components/ui/modal"; 

// Import các Form con
import ReconciliationForm from "./ReconciliationForm";
import { SendEmailForm } from "./ActionForms"; // Form gửi email đã tạo ở bước trước

export default function DebtReconciliationModals() {
  // 1. Lấy state từ Store
  const store = useDebtReconciliationStore();
  
  // 2. Gọi các Hooks API
  const syncMutation = useSyncDebtReconciliation(); // Hook tính toán công nợ
  const emailMutation = useSendReconciliationEmail(); // Hook gửi email

  // 3. Lấy dữ liệu chi tiết (Dùng cho Modal Email để điền sẵn email khách)
  // Chỉ fetch khi có selectedId và modal email đang mở
  const { data: selectedData } = useDebtReconciliation(store.selectedId);
  
  // Xử lý dữ liệu an toàn (đề phòng cấu trúc trả về có wrapper .data)
  const detail = (selectedData as any)?.data || selectedData; 

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MODAL TẠO MỚI / TÍNH TOÁN (CREATE / SYNC)              */}
      {/* ========================================================= */}
      <Modal
        isOpen={store.isCreateModalOpen}
        onClose={store.closeCreateModal}
        className="max-w-xl p-0 overflow-hidden rounded-xl"
        showCloseButton={true}
      >
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tạo / Cập nhật công nợ
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hệ thống tự động tính toán số liệu năm nay dựa trên lịch sử giao dịch.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <ReconciliationForm
            onCancel={store.closeCreateModal}
            loading={syncMutation.isPending}
            onSubmit={async (data) => {
              // Gọi API Sync
              await syncMutation.mutateAsync(data);
              // Thành công thì đóng modal
              store.closeCreateModal();
            }}
          />
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* 2. MODAL GỬI EMAIL (SEND EMAIL)                           */}
      {/* ========================================================= */}
      <Modal
        isOpen={store.isEmailModalOpen}
        onClose={store.closeEmailModal}
        className="max-w-lg p-0 overflow-hidden rounded-xl"
        showCloseButton={true}
      >
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gửi Email thông báo
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gửi biên bản đối chiếu công nợ tới khách hàng/nhà cung cấp.
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Chỉ render form khi modal mở để reset state form */}
          {store.isEmailModalOpen && (
            <SendEmailForm
              isLoading={emailMutation.isPending}
              onCancel={store.closeEmailModal}
              // Điền sẵn thông tin nếu lấy được từ chi tiết
              defaultEmail={detail?.customer?.email || detail?.supplier?.email || ""}
              defaultName={detail?.customer?.customerName || detail?.supplier?.supplierName || ""}
              
              onSubmit={async (data) => {
                if (store.selectedId) {
                  await emailMutation.mutateAsync({ id: store.selectedId, data });
                  store.closeEmailModal();
                }
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
}