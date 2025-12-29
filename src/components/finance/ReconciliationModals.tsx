"use client";

import React from "react";
import { useDebtReconciliationStore } from "@/stores/debtReconciliationStore";
import { useCreateDebtReconciliation } from "@/hooks/api/useDebtReconciliation";
import ReconciliationForm from "./ReconciliationForm";
import { Modal } from "@/components/ui/modal"; // 👇 Import Modal có sẵn

export default function DebtReconciliationModals() {
  const { isCreateModalOpen, closeCreateModal } = useDebtReconciliationStore();
  const createMutation = useCreateDebtReconciliation();

  return (
    <>
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        className="max-w-3xl p-6" // Class tùy chỉnh độ rộng
        showCloseButton={true}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Tạo biên bản đối chiếu mới
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Chọn kỳ và đối tác để hệ thống tự động tính toán số liệu công nợ.
          </p>
        </div>

        <ReconciliationForm
          onCancel={closeCreateModal}
          loading={createMutation.isPending}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
            closeCreateModal();
          }}
        />
      </Modal>
    </>
  );
}