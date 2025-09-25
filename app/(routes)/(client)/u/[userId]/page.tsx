import { ProfileOverview } from "@/components/profile-overview";
import { db } from "@/lib/db";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  const playlists = await db.playlist.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileOverview playlists={playlists} />
    </div>
  );
}
