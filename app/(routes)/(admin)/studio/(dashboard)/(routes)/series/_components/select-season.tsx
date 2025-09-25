"use client";

import { Edit, Plus } from "lucide-react";
import { useState } from "react";

import { AddSeasonDialog } from "@/components/add-season-dialog";
import { ContentList } from "@/components/content-list";
import { DashboardShell } from "@/components/dashboard-shell";
import { EditSeasonDialog } from "@/components/edit-season-dialog"; // Import the new component
import { CreateNewEpisode } from "@/components/models/create-episode-modal";
import { SeasonSelector } from "@/components/season-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEpisode } from "@/hooks/use-episode";
import { Episode, Season, Series } from "@/lib/generated/prisma";

interface SeasonProps {
  seasons: Season[];
  episodes: Episode[];
  series: Series[];
  episodeId: string;
  seriesId: string;
}

export const SelectSeason = ({
  seasons,
  episodes,
  episodeId,
  seriesId,
  series,
}: SeasonProps) => {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons[0]?.id || ""
  );
  const [isEditSeasonOpen, setIsEditSeasonOpen] = useState(false);
  const episode = useEpisode();

  const seasonToEdit = seasons.find((season) => season.id === selectedSeason);

  return (
    <DashboardShell>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-4">
            <SeasonSelector
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSelectSeason={setSelectedSeason}
            />
            <Button
              variant="outline"
              onClick={() => setIsEditSeasonOpen(true)} // Open edit dialog
              disabled={!selectedSeason} // Disable if no season is selected
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Season
            </Button>
            <Button onClick={episode.onOpen} disabled={!selectedSeason}>
              <Plus className="mr-2 h-4 w-4" />
              Add Episode
            </Button>
          </div>
          <Separator className="my-4" />
          <ScrollArea className="h-[32rem]">
            <ContentList
              seasonId={selectedSeason}
              episodeId={episodeId}
              episodes={episodes}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      <AddSeasonDialog series={series} seriesId={series[0].id} />
      {seasonToEdit && ( // Only render if a season is selected for editing
        <EditSeasonDialog
          initialData={seasonToEdit}
          seriesId={seriesId}
          open={isEditSeasonOpen}
          onOpenChange={setIsEditSeasonOpen}
        />
      )}
      <CreateNewEpisode seasonId={selectedSeason} seriesId={series[0].id} />
    </DashboardShell>
  );
};
