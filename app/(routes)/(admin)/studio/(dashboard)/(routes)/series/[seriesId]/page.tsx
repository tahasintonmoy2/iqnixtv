import { db } from "@/lib/db";
import { AddSeriesHeader } from "../_components/add-seeries-header";
import { SeasonView } from "./_components/season/season-view";

interface SeriesIdPageProps {
  params: Promise<{ seriesId: string }>;
}

const SeasonQueryPage = async ({ params }: SeriesIdPageProps) => {
  const { seriesId } = await params;

  const series = await db.series.findUnique({
    where: {
      id: seriesId,
    },
  });

  if (!series) {
    throw new Error("Series id not found");
  }

  const seasons = await db.season.findMany({
    where: {
      seriesId,
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2 ml-3">{series.name}</h1>
      <AddSeriesHeader />
      <SeasonView data={seasons} />
    </div>
  );
};

export default SeasonQueryPage;
