import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { 
  DebtReconciliation, 

} from "@/types/debt-reconciliation.types";
import { DebtReconciliationFilters } from "@/types/finance.types";

interface DebtReconciliationState {
  // --- Filters State ---
  filters: DebtReconciliationFilters & { page: number; limit: number };
  
  // --- Actions ---
  setFilters: (filters: Partial<DebtReconciliationFilters & { page: number; limit: number }>) => void;
  resetFilters: () => void;
  
  // --- Modal State ---
  isCreateModalOpen: boolean;
  isDetailModalOpen: boolean;
  isConfirmModalOpen: boolean;
  isDisputeModalOpen: boolean;
  isEmailModalOpen: boolean;
  
  selectedId: number | null; // ID đang được chọn để xem/sửa
  
  // --- Modal Actions ---
  openCreateModal: () => void;
  closeCreateModal: () => void;
  
  openDetailModal: (id: number) => void;
  closeDetailModal: () => void;
  
  openConfirmModal: (id: number) => void;
  closeConfirmModal: () => void;
  
  openDisputeModal: (id: number) => void;
  closeDisputeModal: () => void;
  
  openEmailModal: (id: number) => void;
  closeEmailModal: () => void;
}

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  sortBy: "reconciliationDate",
  sortOrder: "desc" as const,
};

export const useDebtReconciliationStore = create<DebtReconciliationState>()(
  persist(
    (set) => ({
      // Initial State
      filters: DEFAULT_FILTERS,
      isCreateModalOpen: false,
      isDetailModalOpen: false,
      isConfirmModalOpen: false,
      isDisputeModalOpen: false,
      isEmailModalOpen: false,
      selectedId: null,

      // Actions
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Modals
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),

      openDetailModal: (id) => set({ isDetailModalOpen: true, selectedId: id }),
      closeDetailModal: () => set({ isDetailModalOpen: false, selectedId: null }),

      openConfirmModal: (id) => set({ isConfirmModalOpen: true, selectedId: id }),
      closeConfirmModal: () => set({ isConfirmModalOpen: false, selectedId: null }),
      
      openDisputeModal: (id) => set({ isDisputeModalOpen: true, selectedId: id }),
      closeDisputeModal: () => set({ isDisputeModalOpen: false, selectedId: null }),

      openEmailModal: (id) => set({ isEmailModalOpen: true, selectedId: id }),
      closeEmailModal: () => set({ isEmailModalOpen: false, selectedId: null }),
    }),
    {
      name: "debt-reconciliation-storage",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu filters, không lưu trạng thái modal
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);