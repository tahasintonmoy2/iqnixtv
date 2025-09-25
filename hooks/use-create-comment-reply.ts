import { create } from "zustand";

interface useCreateCommentReply {
  isOpen: boolean;
  selectedCommentId: string | null;
  onOpen: (commentId: string) => void;
  onClose: () => void;
}

export const useCreateCommentReply = create<useCreateCommentReply>((set) => ({
  isOpen: false,
  selectedCommentId: null,
  onOpen: (commentId: string) => set({ isOpen: true, selectedCommentId: commentId }),
  onClose: () => set({ isOpen: false, selectedCommentId: null }),
}));
