import { db } from '@/lib/db';
import { AddTrailerHeader } from './components/add-trailer-header';
import { TrailerColumn } from './components/columns';
import { TrailerView } from './components/trailer-view';

const Trailers = async () => {
  const genre = await db.trailers.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedTrailers: TrailerColumn[] = genre.map((item) => ({
    id: item.id,
    name: item.name,
    thumbnailImageUrl: item.thumbnailImageUrl,
    videoUrl: item.videoUrl,
    type: item.type,
    isPublished: item.isPublished ?? false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <div>
      <AddTrailerHeader />
      <TrailerView data={formattedTrailers} />
    </div>
  )
}

export default Trailers