"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface FilterOption {
  id: string
  label: string
  value: string | boolean | number
  type: "select" | "checkbox" | "radio" | "date" | "range"
  options?: { label: string; value: string }[]
}

interface SearchFilterBarProps {
  onSearchChange: (value: string) => void
  onFilterChange?: (filters: Record<string, string>) => void
  placeholder?: string
  filters?: FilterOption[]
  className?: string
  activeFilters?: Record<string, string>
  children?: React.ReactNode
}

export function SearchFilterBar({
  onSearchChange,
  onFilterChange,
  placeholder = "Search...",
  filters = [],
  className,
  activeFilters = {},
  children,
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(activeFilters)
  const [showClearSearch, setShowClearSearch] = useState(false)

  // Count active filters
  const activeFilterCount = Object.keys(appliedFilters).length

  useEffect(() => {
    // Debounce search to avoid too many updates
    const handler = setTimeout(() => {
      onSearchChange(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery, onSearchChange])

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(appliedFilters)
    }
  }, [appliedFilters, onFilterChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowClearSearch(e.target.value.length > 0)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowClearSearch(false)
    onSearchChange("")
  }

  const clearAllFilters = () => {
    setAppliedFilters({})
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  return (
    <div className={cn("flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2", className)}>
      <div className="relative flex-1 w-28">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-8 pr-8"
        />
        {showClearSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {children}

      {filters.length > 0 && (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Filter options would be rendered here */}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" size="sm" className="w-full justify-center" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
