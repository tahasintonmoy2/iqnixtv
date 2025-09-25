import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SeasonState {
  selectedSeasonId: string | null
  setSelectedSeasonId: (id: string) => void
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set) => ({
      selectedSeasonId: null,
      setSelectedSeasonId: (id) => set({ selectedSeasonId: id }),
    }),
    {
      name: 'season-storage',
    }
  )
)
