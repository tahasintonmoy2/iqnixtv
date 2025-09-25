import { EpisodeForm } from "@/components/series/seasons/episodes/episode-form";
import { db } from "@/lib/db";
import React from "react";

interface EpsiodeIdPageProps {
  params: Promise<{ episodeId: string; seriesId: string; seasonId: string }>;
}

const EpsiodeIdPage = async ({ params }: EpsiodeIdPageProps) => {
  const { episodeId, seriesId, seasonId } = await params;

  const season = await db.season.findUnique({
    where: {
      id: seasonId,
    },
  });

  const episode = await db.episode.findUnique({
    where: {
      id: episodeId,
    },
    include: {
      muxData: true,
    },
  });

  const ageRatings = await db.ageRating.findMany({
    orderBy: {
      name: "asc",
    },
  });

  if (!season) {
    throw new Error("Season not found");
  }

  if (!episode) {
    throw new Error("Episode not found");
  }

  return (
    <div>
      <EpisodeForm
        episode={episode}
        seasonId={season.id}
        seriesId={seriesId}
        seasonOptions={[
          {
            name: season.name,
            value: season.id,
            seasonNumber: season.seasonNumber,
          },
        ]}
        ageRatingOptions={ageRatings.map((ageRating) => ({
          name: ageRating.name,
          value: ageRating.id,
        }))}
      />
    </div>
  );
};

export default EpsiodeIdPage;

//DBBL Pin - 157612
