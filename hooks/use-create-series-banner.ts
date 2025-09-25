import { create } from "zustand";

type CreateSeriesStore = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useCreateBannerSeries = create<CreateSeriesStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));