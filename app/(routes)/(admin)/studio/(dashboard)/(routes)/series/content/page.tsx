import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { ContentOverview } from "./_components/content-overivew";
import { SeriesColumn } from "./_components/series/columns";
import { SeriesView } from "./_components/series/series-view";

export default async function ContentPage() {
  const series = await db.series.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seasons: true,
      episodes: true,
    },
  });

  const formattedSeasons: SeriesColumn[] = await Promise.all(
    series.map(async (item) => {
      // Process genre for each item
      const selectedGenreIds = (item.genreId ?? "")
        .split(",")
        .map((val) => val.trim())
        .filter(Boolean);

      const genreRecords = selectedGenreIds.length
        ? await db.genre.findMany({
            where: { id: { in: selectedGenreIds } },
            select: { id: true, name: true },
          })
        : [];

      // Process age rating for each item
      const selectedAgeIds = (item.ageRatingId ?? "")
        .split(",")
        .map((val) => val.trim())
        .filter(Boolean);

      const ageRecords = selectedAgeIds.length
        ? await db.ageRating.findMany({
            where: { id: { in: selectedAgeIds } },
            select: { id: true, name: true },
          })
        : [];

      const selectedContentLanguageIds = (item.contentLanguageId ?? "")
        .split(",")
        .map((val) => val.trim())
        .filter(Boolean);

      const contentLanguageRecords = selectedAgeIds
        ? await db.contentLanguage.findMany({
            where: {
              id: { in: selectedContentLanguageIds },
            },
            select: { id: true, name: true },
          })
        : [];

      return {
        id: item.id,
        name: item.name,
        ageRating: ageRecords.map((a) => a.name),
        allowedRegion: item.region,
        contentLanguage: contentLanguageRecords.map((c) => c.name),
        contentRegion: item.region,
        description: item.description,
        releaseDate: item.releaseDate || new Date(),
        thumbnailImageUrl: item.thumbnailImageUrl,
        genre: genreRecords.map((g) => g.name),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Content Overview</h1>
      </div>
      <div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mb-8">
            <ContentOverview series={series} />
          </TabsContent>
          <TabsContent value="series" className="mb-8">
            <SeriesView data={formattedSeasons} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
