import { create } from "zustand";

interface useCreatePlaylistModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreatePlaylistModal = create<useCreatePlaylistModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
