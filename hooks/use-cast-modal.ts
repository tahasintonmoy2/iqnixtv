import { create } from "zustand";

interface useCastModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCastModal = create<useCastModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
