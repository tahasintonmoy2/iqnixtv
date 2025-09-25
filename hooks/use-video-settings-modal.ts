import { create } from "zustand";

interface useVideoSettingsModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useVideoSettingsModal = create<useVideoSettingsModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
