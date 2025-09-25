import { create } from "zustand";

interface useWatchlistModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useWatchlistModal = create<useWatchlistModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
