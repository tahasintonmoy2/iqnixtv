import { siteConfig } from "@/config/site";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CastClient } from "./_components/client";
import { CastColumn } from "./_components/columns";

export const metadata: Metadata = {
  title: "Casts",
  description: siteConfig.description,
};

const Cast = async () => {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/auth/sign-in");
  }

  // Fetch all cast members - they are not directly related to users
  const cast = await db.cast.findMany({
    include: {
      season: {
        include: {
          casts: true,
          episodes: true
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCast: CastColumn[] = cast.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    bio: item.bio,
    height: item.height,
    weight: item.weight,
    age: item.age,
    gender: item.gender,
    dateOfBirth: item.dateOfBirth!,
    region: item.region,
    career: item.career,
    alsoKnownAs: item.alsoKnownAs,
    isFeatured: item.isFeatured,
    seasonId: item.seasonId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CastClient data={formattedCast} />
      </div>
    </div>
  );
};

export default Cast;
