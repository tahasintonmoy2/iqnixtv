import { create } from "zustand";

type EpisodeStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useEpisode = create<EpisodeStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));