import { EditLibraryItemDialog } from "@/components/edit-library-item-dialog";
import { LibraryContent } from "@/components/library-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { AddLibraryHeader } from "../series/_components/add-library-header";

export default async function LibraryPage() {
  const series = await db.series.findMany({
    orderBy: {
      name: "desc",
    },
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
    where: {
      isPublished: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  return (
    <>
      <AddLibraryHeader />

      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>
            View and manage all content in your library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LibraryContent />
        </CardContent>
      </Card>

      {/* Add Content Dialog */}
      <EditLibraryItemDialog
        item={series[0]}
        seasons={seasons}
        episodes={episodes}
        categories={categories}
      />
    </>
  );
}
