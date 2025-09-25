import { db } from "@/lib/db";
import { ContentForm } from "../_components/content-form";

interface SeriesIdProps {
  params: Promise<{ contentId: string }>;
}

const SeriesIdPage = async ({ params }: SeriesIdProps) => {
  const { contentId } = await params;

  const series = await db.series.findUnique({
    where: {
      id: contentId,
    },
    include: {
      seasons: true
    }
  });

  const seasons = await db.season.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  const episodes = await db.episode.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      name: "desc",
    },
  });
  const categories = await db.genre.findMany({
    orderBy: {
      name: "desc",
    },
  });
  const contentLanguage = await db.contentLanguage.findMany({
    orderBy: {
      name: "desc",
    },
  });

  const ageRatings = await db.ageRating.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <ContentForm
        series={series!}
        seasons={seasons}
        episodes={episodes}
        categories={categories}
        contentLanguage={contentLanguage}
        ageRatingOptions={ageRatings.map((ageRating) => ({
          name: ageRating.name,
          value: ageRating.id,
        }))}
      />
    </div>
  );
};

export default SeriesIdPage;
