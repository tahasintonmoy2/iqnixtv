"use server";
import { db } from "@/lib/db";

export const getSeries = async ({ seriesId }: { seriesId: string }) => {
  return await db.series.findUnique({
    where: {
      id: seriesId,
    },
    include: {
      episodes: true,
      ageRating: true,
    },
  });
};
