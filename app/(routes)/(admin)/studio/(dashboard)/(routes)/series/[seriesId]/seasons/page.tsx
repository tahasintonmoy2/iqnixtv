import { AddSeasonHeader } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/add-season-header";
import { SelectSeason } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/select-season";
import { AddSeasonDialog } from "@/components/add-season-dialog";
import { db } from "@/lib/db";

interface SeasonQueryProps {
  params: Promise<{ seriesId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SeasonQueryPage = async ({ searchParams, params }: SeasonQueryProps) => {
  const seasonId = await searchParams;
  const { seriesId } = await params;

  const episode = await db.episode.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const series = await db.series.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const seasons = await db.season.findUnique({
    where: {
      id: seriesId
    },
  });

  if (!seriesId) {
    throw new Error("Series id not found");
  }

  if (!seasonId) {
    return (
      <div>
        <AddSeasonHeader />
        <AddSeasonDialog series={series} seriesId={seriesId} />
        <SelectSeason
          seasons={seasons ? [seasons] : []}
          series={series}
          seriesId={seriesId}
          episodes={episode}
          episodeId={episode[0]?.id}
        />
      </div>
    );
  }

  return (
    <div>
      <AddSeasonHeader />
      <AddSeasonDialog series={series} seriesId={seriesId} />

      <SelectSeason
        seasons={seasons ? [seasons] : []}
        series={series}
        seriesId={seriesId}
        episodes={episode}
        episodeId={episode[0]?.id}
      />
    </div>
  );
};

export default SeasonQueryPage;
