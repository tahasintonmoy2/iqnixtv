"use client"

import { useState } from "react"
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FilterOption {
  id: string
  label: string
  type: "select" | "checkbox" | "radio" | "date" | "range"
  options?: { label: string; value: string }[]
}

interface AdvancedFilterDropdownProps {
  filters: FilterOption[]
  activeFilters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
}

export function AdvancedFilterDropdown({ filters, activeFilters, onFilterChange }: AdvancedFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters)

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).length

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilters }

    if (value === undefined || value === null || value === "") {
      delete newFilters[filterId]
    } else {
      newFilters[filterId] = value
    }

    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
    setOpen(false)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFilterChange({})
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filters</h4>
            {Object.keys(localFilters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
                Clear all
              </Button>
            )}
          </div>
          <Separator className="my-2" />
          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <Label htmlFor={filter.id} className="text-xs font-medium">
                  {filter.label}
                </Label>
                {filter.type === "select" && filter.options && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        {localFilters[filter.id]
                          ? filter.options.find((option) => option.value === localFilters[filter.id])?.label ||
                            "Select..."
                          : "Select..."}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {filter.options.map((option) => (
                              <CommandItem
                                key={option.value}
                                onSelect={() => handleFilterChange(filter.id, option.value)}
                                className="flex items-center"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    localFilters[filter.id] === option.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                {filter.type === "checkbox" && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${filter.id}-${option.value}`}
                          checked={
                            Array.isArray(localFilters[filter.id])
                              ? localFilters[filter.id]?.includes(option.value)
                              : false
                          }
                          onCheckedChange={(checked) => {
                            const currentValues = Array.isArray(localFilters[filter.id])
                              ? [...localFilters[filter.id]]
                              : []

                            if (checked) {
                              handleFilterChange(filter.id, [...currentValues, option.value])
                            } else {
                              handleFilterChange(
                                filter.id,
                                currentValues.filter((v) => v !== option.value),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`${filter.id}-${option.value}`} className="text-xs">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
