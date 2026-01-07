import { TrailerForm } from "@/components/series/trailer/trailer-form";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

interface SeriesIdProps {
  params: Promise<{ trailerId: string }>;
}

const TrailerId = async ({ params }: SeriesIdProps) => {
  const { trailerId } = await params;

  const trailer = await db.trailers.findUnique({
    where: {
      id: trailerId,
    },
    include: {
      muxData: true
    }
  });

  if (!trailer?.id) {
    return redirect("/studio/trailers");
  }

  const series = await db.series.findMany({
    where: {
      isPublished: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <TrailerForm
        trailer={trailer}
        trailerId={trailerId}
        seriesOptions={series.map((item) => ({
          name: item.name,
          value: item.id,
        }))}
      />
    </div>
  );
};

export default TrailerId;
