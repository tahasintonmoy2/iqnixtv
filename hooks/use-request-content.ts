import { create } from "zustand";

type RequestContentStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useRequestContent = create<RequestContentStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));