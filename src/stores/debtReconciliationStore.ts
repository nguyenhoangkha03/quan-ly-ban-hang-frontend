import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DebtReconciliationParams } from "@/types/debt-reconciliation.types";

interface DebtReconciliationState {
  // --- Filters State ---
  filters: DebtReconciliationParams;
  setFilters: (filters: Partial<DebtReconciliationParams>) => void;
  resetFilters: () => void;
  
  // --- Modal State ---
  // Chỉ còn 2 modal chính
  isCreateModalOpen: boolean;
  isEmailModalOpen: boolean;
  
  // ID của bản ghi đang được chọn để thao tác (ví dụ: để gửi email)
  selectedId: number | null; 
  
  // --- Modal Actions ---
  openCreateModal: () => void;
  closeCreateModal: () => void;
  
  openEmailModal: (id: number) => void;
  closeEmailModal: () => void;
}

const DEFAULT_FILTERS: DebtReconciliationParams = {
  page: 1,
  limit: 20,
  sortBy: "updatedAt", // Sắp xếp theo ngày cập nhật mới nhất
  sortOrder: "desc",
};

export const useDebtReconciliationStore = create<DebtReconciliationState>()(
  persist(
    (set) => ({
      // Initial State
      filters: DEFAULT_FILTERS,
      isCreateModalOpen: false,
      isEmailModalOpen: false,
      selectedId: null,

      // Actions
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Modals
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),

      openEmailModal: (id) => set({ isEmailModalOpen: true, selectedId: id }),
      closeEmailModal: () => set({ isEmailModalOpen: false, selectedId: null }),
    }),
    {
      name: "debt-reconciliation-storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu filters vào localStorage, không lưu trạng thái modal
      partialize: (state) => ({ filters: state.filters }), 
    }
  )
);