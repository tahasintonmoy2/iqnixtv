import { create } from "zustand";

type CastMemberProfileStore = {
  isOpen: boolean;
  onOpenCasProfile: () => void;
  onCloseCastProfile: () => void;
};

export const useCastMemberProfile = create<CastMemberProfileStore>((set) => ({
  isOpen: false,
  onOpenCasProfile: () => set({ isOpen: true }),
  onCloseCastProfile: () => set({ isOpen: false }),
}));