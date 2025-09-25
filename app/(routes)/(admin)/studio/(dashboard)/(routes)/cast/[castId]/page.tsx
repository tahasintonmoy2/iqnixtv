import { CastForm } from "@/components/cast-member-form";
import { db } from "@/lib/db";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ castId: string }>;
}) {
  const { castId } = await params;

  const cast = await db.cast.findUnique({
    where: {
      id: castId,
    },
  });

  if (!cast?.id) {
    return {
      title: "Create an new cast",
    };
  }

  return {
    title: `Edit ${cast?.name}`,
  };
}

const CastIdPage = async ({
  params,
}: {
  params: Promise<{ castId: string }>;
}) => {
  const { castId } = await params;

  const cast = await db.cast.findUnique({
    where: {
      id: castId,
    },
  });

  const season = await db.season.findFirst();

  if (!season?.id) {
    throw new Error("Not Found season Id");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-4 p-8 pt-6">
        <CastForm initialData={cast} seasonId={season.id} />
      </div>
    </div>
  );
};

export default CastIdPage;
