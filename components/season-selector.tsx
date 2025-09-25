"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Season } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: string;
  onSelectSeason: (seasonId: string) => void;
  seriesId?: string; // Optional seriesId to filter seasons
}

export function SeasonSelector({
  seasons,
  selectedSeason,
  onSelectSeason,
  seriesId,
}: SeasonSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // Filter seasons by seriesId if provided
  const filteredSeasons = seriesId 
    ? seasons.filter(season => season.seriesId === seriesId)
    : seasons;
    
  const selectedSeasonN = filteredSeasons.find(
    (season) => season.id === selectedSeason
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedSeasonN?.name} {selectedSeasonN?.seasonNumber}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search season..." className="h-9" />
          <CommandList>
            <CommandEmpty>No season found.</CommandEmpty>
            <CommandGroup>
              {filteredSeasons.map((season) => (
                <CommandItem
                  key={season.id}
                  value={season.id}
                  onSelect={() => {
                    onSelectSeason(season.id);
                    setOpen(false);
                  }}
                >
                  {season.name} {season.seasonNumber}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedSeason === season.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
