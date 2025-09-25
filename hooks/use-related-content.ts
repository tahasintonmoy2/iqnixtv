import { Episode, Season, Series } from "@/lib/generated/prisma";
import axios from "axios";
import { useEffect, useState } from "react";

interface RelatedContentData {
  content: Series[];
  seasons: (Season & {
    episodes: Episode[];
  })[];
}

export function useRelatedContent(seriesId: string, genre?: string[], limit: number = 10) {
  const [data, setData] = useState<RelatedContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/series/related`, {
          params: {
            seriesId,
            genre: genre?.join(","),
            limit
          }
        });
        setData(response.data);
      } catch (err) {
        console.error("Error fetching related content:", err);
        setError("Failed to load related content");
      } finally {
        setLoading(false);
      }
    };

    if (seriesId) {
      fetchRelatedContent();
    }
  }, [seriesId, genre, limit]);

  return { data, loading, error };
}
