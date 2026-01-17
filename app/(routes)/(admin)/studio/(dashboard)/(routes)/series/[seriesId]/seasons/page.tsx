import { AddSeasonHeader } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/add-season-header";
import { SelectSeason } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/_components/select-season";

interface SeasonQueryProps {
  params: Promise<{ seriesId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SeasonQueryPage = async ({ searchParams, params }: SeasonQueryProps) => {
  const seasonId = await searchParams;
  const { seriesId } = await params;

  if (!seriesId) {
    throw new Error("Series id not found");
  }

  if (!seasonId) {
    return (
      <div>
        <AddSeasonHeader />
        {/* <AddSeasonDialog series={series} seriesId={seriesId} /> */}
        <SelectSeason
          seriesId={seriesId}
        />
      </div>
    );
  }

  return (
    <div>
      <AddSeasonHeader />
      {/* <AddSeasonDialog series={series} seriesId={seriesId} /> */}

      <SelectSeason
        seriesId={seriesId}
      />
    </div>
  );
};

export default SeasonQueryPage;
