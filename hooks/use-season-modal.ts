import { create } from "zustand";

interface useSeasonModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSeasonModal = create<useSeasonModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
