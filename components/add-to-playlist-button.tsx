"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import axios from "axios";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { toast } from "sonner";

interface AddToPlaylistButtonProps {
  seriesId: string;
  playlistId: string | null;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export const AddToPlaylistButton = ({
  seriesId,
  playlistId,
  variant = "outline",
  className = "gap-2",
}: AddToPlaylistButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const router = useRouter();

  const handleAddToMyList = async () => {
    if (!user) {
      toast.error("Please sign in to add to your list");
      return;
    }

    try {
      if (playlistId) {
        setIsLoadingDelete(true);
        await axios.delete(`/api/series/${seriesId}/playlists/${playlistId}`, {
          data: {
            playlistId,
          },
        });
        router.refresh();
        toast.success("Removed from Watch later");
      } else {
        setIsLoading(true);
        await axios.post(`/api/series/${seriesId}/playlists`, {
          name: "Watch later",
          description: "Your personal collection of favorite content",
          seriesId,
        });
        router.refresh();
        toast.success("Added to Watch later");
      }
    } catch (error) {
      if (!playlistId) {
        toast.error("Failed to delete playlist");
        setIsLoadingDelete(true);
      } else {
        toast.error("Failed to add playlist");
        setIsLoading(false);
      }
      console.error("Error adding to list:", error);
    } finally {
      setIsLoadingDelete(false);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleAddToMyList}
      disabled={isLoadingDelete || isLoading}
    >
      {playlistId ? <BsBookmarkCheckFill size={16} /> : <Bookmark size={16} />}
      {playlistId && !isLoading ? (
        <p>{isLoadingDelete ? "Removing" : "Added to playlist"}</p>
      ) : (
        <p>{isLoading ? "Adding" : "Watch later"}</p>
      )}
    </Button>
  );
};
