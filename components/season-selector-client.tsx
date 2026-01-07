"use client";

import { CheckIcon } from "@radix-ui/react-icons";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeason: string;
  onSelectSeason: (seasonId: string) => void;
  seriesId?: string; // Optional seriesId to filter seasons
}

export function SeasonSelectorClient({
  seasons,
  selectedSeason,
  onSelectSeason,
  seriesId,
}: SeasonSelectorProps) {
  // Filter seasons by seriesId if provided
  const filteredSeasons = seriesId 
    ? seasons.filter(season => season.seriesId === seriesId)
    : seasons;
    
  const selectedSeasonN = filteredSeasons.find(
    (season) => season.id === selectedSeason
  );

  return (
    <Select value={selectedSeason} onValueChange={onSelectSeason}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue
          placeholder="Select a season"
          defaultValue={filteredSeasons[0]?.id}
        >
          {selectedSeasonN
            ? `${selectedSeasonN.name} ${selectedSeasonN.seasonNumber}`
            : `${filteredSeasons[0]?.name} ${filteredSeasons[0]?.seasonNumber}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {filteredSeasons.map((season) => (
          <SelectItem
            key={season.id}
            value={season.id}
            className={cn("cursor-pointer", season.id === selectedSeasonN?.id && "bg-secondary")}
            onSelect={() => {
              onSelectSeason(season.id);
            }}
          >
            {season.name} {season.seasonNumber}
            <CheckIcon
              className={cn(
                "absolute right-2 flex size-4 items-center justify-center",
                selectedSeason === season.id ? "opacity-100" : "opacity-0"
              )}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
