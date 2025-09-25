import { AddSeasonHeader } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/add-season-header";
import { SelectSeason } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/select-season";
import { AddSeasonDialog } from "@/components/add-season-dialog";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface SeasonQueryProps {
  params: Promise<{ seriesId: string; seasonId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SeasonQueryPage = async ({ params }: SeasonQueryProps) => {
  const { seasonId } = await params;
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

  const season = await db.season.findUnique({
    where: {
      id: seasonId,
    },
  });

  if (!season?.id) {
    return (
      <>
        <AddSeasonDialog series={series} seriesId={seriesId} />
        <div>
          <AddSeasonHeader />
          <SelectSeason
            seasons={season ? [season] : []}
            series={series}
            seriesId={seriesId}
            episodes={episode}
            episodeId={episode[0]?.id}
          />
          <Separator className="my-4" />
          <div className="flex items-center justify-center">
            <div className="flex flex-col text-center max-w-96 items-center font-medium p-2 border text-red-600 border-red-500 bg-red-800/35 rounded-sm">
              <ExclamationTriangleIcon className="mr-2 size-8" />
              <h1 className="text-lg">No episodes found for this season.</h1>
              <p className="text-sm">
                Please create a new season or select an existing one to view its
                episodes.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-8 mb-8">
      <AddSeasonHeader />

      <SelectSeason
        seasons={season ? [season] : []}
        series={series}
        seriesId={seriesId}
        episodes={episode}
        episodeId={episode[0]?.id}
      />
      <AddSeasonDialog series={series} seriesId={seriesId} />
    </div>
  );
};

export default SeasonQueryPage;
