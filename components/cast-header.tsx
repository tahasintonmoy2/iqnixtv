"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { AdvancedFilterDropdown } from "@/components/advanced-filter-dropdown"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CastHeaderProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: Record<string, string>) => void
}

export function CastHeader({ onSearch, onFilterChange }: CastHeaderProps) {
  const [date, setDate] = useState<Date>()
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const router = useRouter();

  // Define filter options
  const filterOptions = [
    {
      id: "role",
      label: "Role",
      type: "select" as const,
      options: [
        { label: "Actor", value: "actor" },
        { label: "Director", value: "director" },
        { label: "Producer", value: "producer" },
        { label: "Writer", value: "writer" },
        { label: "Cinematographer", value: "cinematographer" },
      ],
    },
    {
      id: "featured",
      label: "Featured Status",
      type: "select" as const,
      options: [
        { label: "Featured", value: "featured" },
        { label: "Regular", value: "regular" },
      ],
    },
    {
      id: "productionType",
      label: "Production Type",
      type: "checkbox" as const,
      options: [
        { label: "Movies", value: "movie" },
        { label: "Series", value: "series" },
        { label: "Documentary", value: "documentary" },
      ],
    },
  ]

  useEffect(() => {
    if (date) {
      const newFilters = { ...activeFilters, date: format(date, "yyyy-MM-dd") }
      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }, [date, onFilterChange, activeFilters])

  const handleAdvancedFilterChange = (filters: Record<string, string>) => {
    const newFilters = { ...filters }
    if (date) {
      newFilters.date = format(date, "yyyy-MM-dd")
    }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateClear = () => {
    setDate(undefined)
    const { ...restFilters } = activeFilters
    setActiveFilters(restFilters)
    onFilterChange(restFilters)
  }

  return (
    <div className="flex space-y-4 flex-row items-center mb-4">
      <SearchFilterBar placeholder="Search cast members..." onSearchChange={onSearch} className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Filter by date"}
              {date && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDateClear()
                  }}
                >
                  <span className="sr-only">Clear date</span>
                  <span aria-hidden>×</span>
                </Button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        <AdvancedFilterDropdown
          filters={filterOptions}
          activeFilters={activeFilters}
          onFilterChange={handleAdvancedFilterChange}
        />

        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </SearchFilterBar>

      <Button onClick={()=> router.push("/cast/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Add Cast Member
      </Button>
    </div>
  )
}
