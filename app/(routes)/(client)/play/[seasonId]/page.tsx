import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

const SeasonId = async ({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) => {
  const { seasonId } = await params;

  const season = await db.season.findUnique({
    where: {
      id: seasonId,
    },
    include: {
      episodes: {
        where: {
          seasonId,
          isPublished: true,
        },
        orderBy: {
          episodeNumber: "asc",
        },
      },
    },
  });

  if (!season) {
    notFound();
  }

  if (!season.episodes || season.episodes.length === 0) {
    notFound();
  }

  return redirect(
    `/play/${season.id}/${season.episodes[0].id}`
  );
};

export default SeasonId;
