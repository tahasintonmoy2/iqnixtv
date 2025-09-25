import { create } from "zustand";

interface useDeleteReplyModal {
  isOpen: boolean;
  selectedReplyId: string | null;
  onOpen: (replyId: string) => void;
  onClose: () => void;
}

export const useDeleteReplyModal = create<useDeleteReplyModal>((set) => ({
  isOpen: false,
  selectedReplyId: null,
  onOpen: (replyId: string) => set({ isOpen: true, selectedReplyId: replyId }),
  onClose: () => set({ isOpen: false, selectedReplyId: null }),
}));
