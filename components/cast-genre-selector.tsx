"use client"

import { FormDescription, FormItem, FormLabel } from "@/components/ui/form"
import { MultiSelect, MultiSelectContent, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"
import { Cast, Genre } from "@/lib/generated/prisma"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CastGenreSelectorProps {
  selectedCasts: string[]
  selectedGenres: string[]
  onCastsChange: (casts: string[]) => void
  onGenresChange: (genres: string[]) => void
  disabled?: boolean
}

export function CastGenreSelector({
  selectedCasts,
  selectedGenres,
  onCastsChange,
  onGenresChange,
  disabled = false
}: CastGenreSelectorProps) {
  const [availableCasts, setAvailableCasts] = useState<Cast[]>([])
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all available casts
        const castsResponse = await axios.get('/api/series/season/cast')
        setAvailableCasts(castsResponse.data)

        // Fetch all available genres
        const genresResponse = await axios.get('/api/categories')
        setAvailableGenres(genresResponse.data)
      } catch (error) {
        console.error('Error fetching cast and genre data:', error)
        toast.error("Failed to load cast and genre data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cast Selection */}
      <FormItem>
        <FormLabel>Cast Members</FormLabel>
        <MultiSelect
          values={selectedCasts}
          onValuesChange={onCastsChange}
        >
          <MultiSelectTrigger disabled={disabled}>
            <MultiSelectValue placeholder="Select cast members" disabled={disabled} />
          </MultiSelectTrigger>
          <MultiSelectContent>
            {availableCasts.map((cast) => (
              <MultiSelectItem key={cast.id} value={cast.id}>
                {cast.name}
              </MultiSelectItem>
            ))}
          </MultiSelectContent>
        </MultiSelect>
        <FormDescription>
          Select the cast members for this content
        </FormDescription>
      </FormItem>

      {/* Genre Selection */}
      <FormItem>
        <FormLabel>Genres</FormLabel>
        <MultiSelect
          values={selectedGenres}
          onValuesChange={onGenresChange}
        >
          <MultiSelectTrigger disabled={disabled}>
            <MultiSelectValue placeholder="Select genres" disabled={disabled} />
          </MultiSelectTrigger>
          <MultiSelectContent>
            {availableGenres.map((genre) => (
              <MultiSelectItem key={genre.id} value={genre.id}>
                {genre.name}
              </MultiSelectItem>
            ))}
          </MultiSelectContent>
        </MultiSelect>
        <FormDescription>
          Select the genres for this content
        </FormDescription>
      </FormItem>
    </div>
  )
} 