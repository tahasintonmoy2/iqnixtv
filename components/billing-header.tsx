"use client"

import { useState } from "react"
import { CalendarIcon, Download, RefreshCw } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { AdvancedFilterDropdown } from "@/components/advanced-filter-dropdown"
import { cn } from "@/lib/utils"

interface BillingHeaderProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: Record<string, any>) => void
}

export function BillingHeader({ onSearch, onFilterChange }: BillingHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [date, setDate] = useState<Date>()
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  // Define filter options
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { label: "Active", value: "active" },
        { label: "Canceled", value: "canceled" },
        { label: "Past Due", value: "past_due" },
      ],
    },
    {
      id: "plan",
      label: "Plan",
      type: "select" as const,
      options: [
        { label: "Basic", value: "Basic" },
        { label: "Premium", value: "Premium" },
        { label: "Family", value: "Family" },
      ],
    },
    {
      id: "billingCycle",
      label: "Billing Cycle",
      type: "select" as const,
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Yearly", value: "Yearly" },
      ],
    },
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const handleAdvancedFilterChange = (filters: Record<string, any>) => {
    const newFilters = { ...filters }
    if (date) {
      newFilters.date = format(date, "yyyy-MM-dd")
    }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateClear = () => {
    setDate(undefined)
    const { date: _, ...restFilters } = activeFilters
    setActiveFilters(restFilters)
    onFilterChange(restFilters)
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <SearchFilterBar placeholder="Search subscriptions..." onSearchChange={onSearch} className="flex-1">
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

        <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </SearchFilterBar>
    </div>
  )
}
