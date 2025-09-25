import { Playlist } from "@/lib/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const playlistKeys = {
  all: ["playlists"] as const,
  lists: () => [...playlistKeys.all] as const,
  list: (filters: string) => [...playlistKeys.lists(), { filters }] as const,
  details: () => [...playlistKeys.all, "details"] as const,
  detail: (id: string) => [...playlistKeys.details(), id] as const,
};

export const usePlaylists = () => {
  return useQuery({
    queryKey: playlistKeys.lists(),
    queryFn: async (): Promise<Playlist[]> => {
      const response = await axios.get("/api/playlists");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 12 * 60 * 1000,
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      seriesId,
    }: {
      name: string;
      description: string;
      seriesId?: string;
    }): Promise<Playlist> => {
      const response = await axios.post("/api/playlists", {
        name,
        description,
        seriesId,
      });

      return response.data;
    },
    onSuccess: (newPlaylsit) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      queryClient.setQueryData(
        playlistKeys.lists(),
        (old: Playlist[] | undefined) => {
          if (old) return [newPlaylsit, ...old];
          return [newPlaylsit];
        }
      );

      router.refresh();
      toast.success("Playlist created!");
    },
    onError: (error) => {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    },
  });
};

// Add series to playlist mutation
export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      playlistId,
      seriesId,
    }: {
      playlistId: string;
      seriesId: string;
    }): Promise<void> => {
      await axios.post(`/api/playlists/${playlistId}`, {
        seriesId,
      });
    },
    onSuccess: () => {
      // Invalidate playlists to refetch updated data
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
      router.refresh();
      toast.success("Added to playlist!");
    },
    onError: (error) => {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add to playlist");
    },
  });
};

// Quick add to "My List" playlist
export const useAddToMyList = () => {
  const createPlaylist = useCreatePlaylist();
  const { data: playlists } = usePlaylists();
  const router = useRouter();

  return useMutation({
    mutationFn: async (seriesId: string): Promise<void> => {
      // Check if "My List" playlist already exists
      const myListPlaylist = playlists?.find(
        (playlist) => playlist.name === "My List"
      );

      if (myListPlaylist) {
        // Add to existing "My List" playlist
        await axios.post(`/api/playlists/${myListPlaylist.id}`, {
          seriesId,
        });
      } else {
        // Create new "My List" playlist with the series
        await createPlaylist.mutateAsync({
          name: "My List",
          description: "Your personal collection of favorite content",
          seriesId,
        });
      }
    },
    onSuccess: () => {
      router.refresh();
      toast.success("Added to My List!");
    },
    onError: (error) => {
      console.error("Error adding to My List:", error);
      toast.error("Failed to add to My List");
    },
  });
};
