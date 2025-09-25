"use client";

import { Cast, Episode, Genre, Season, Series } from "@/lib/generated/prisma";
import { useState } from "react";
import { AddCastDialog } from "./add-cast-dialog";
import { ContentForm } from "./content-form";

interface CastWrapperProps {
  casts: Cast[];
  content: Series;
  seasons: Season[];
  episodes: Episode[];
  categories: Genre[];
  ageRatingOptions: { value: string; name: string }[];
}

export const CastWrapper = ({
  casts,
  content,
  seasons,
  episodes,
  categories,
  ageRatingOptions
}: CastWrapperProps) => {
  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);

  const handleCastContinue = (casts: Cast[]) => {
    setSelectedCasts(casts);
  };

  return (
    <div>
      <AddCastDialog casts={casts} onContinue={handleCastContinue} />
      <ContentForm
        content={content}
        seasons={seasons}
        episodes={episodes}
        categories={categories}
        selectedCasts={selectedCasts}
        ageRatingOptions={ageRatingOptions}
      />
    </div>
  );
}; 