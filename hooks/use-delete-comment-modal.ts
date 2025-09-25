import { create } from "zustand";

interface useDeleteCommentModal {
  isOpen: boolean;
  selectedCommentId: string | null;
  onOpen: (commentId: string) => void;
  onClose: () => void;
}

export const useDeleteCommentModal = create<useDeleteCommentModal>((set) => ({
  isOpen: false,
  selectedCommentId: null,
  onOpen: (commentId: string) => set({ isOpen: true, selectedCommentId: commentId }),
  onClose: () => set({ isOpen: false, selectedCommentId: null }),
}));
