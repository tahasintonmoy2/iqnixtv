"use client";
import { Clock, Edit, MoreHorizontal, Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Episode } from "@/types";
import { format } from "date-fns";
import Link from "next/link";

interface ContentListProps {
  seasonId: string | null;
  episodeId: string;
  episodes: Episode[];
}

export function ContentList({
  seasonId,
  episodes,
  episodeId,
}: ContentListProps) {
  // Filter episodes by season
  const filteredEpisodes = episodes.filter(
    (episode) => episode.seasonId === seasonId
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredEpisodes.map((episode) => (
        <Card key={episode.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              <Clock className="h-3 w-3" />
              {episode.duration}
            </div>
          </div>
          <CardHeader className="p-4 pb-0">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{episode.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="mt-2 line-clamp-2">
              {episode.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                Release:{" "}
                {episode.releaseDate
                  ? format(episode.releaseDate, "MMM d, yyyy")
                  : "Not set"}
              </div>
              <Badge variant={episode.isPublished ? "default" : "secondary"}>
                {episode.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Published</span>
                <Switch checked={!!episode.isPublished} />
              </div>
              <Link href={`/series/seasons/${seasonId}/episodes/${episodeId}`}>
                <Button size="sm" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
      {filteredEpisodes.length === 0 && (
        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            No episodes found for this season.
          </p>
        </div>
      )}
    </div>
  );
}
