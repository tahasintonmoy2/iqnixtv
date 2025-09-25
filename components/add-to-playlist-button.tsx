"use client";

import { Button } from "@/components/ui/button";
import { useAddToMyList } from "@/hooks/use-playlists";
import { useUser } from "@/hooks/use-user";
import { useWatchlistModal } from "@/hooks/use-watchlist-modal";
import { Bookmark, BookmarkMinus } from "lucide-react";
import { toast } from "sonner";

interface AddToPlaylistButtonProps {
  seriesId: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export const AddToPlaylistButton = ({
  seriesId,
  variant = "outline",
  className = "gap-2",
}: AddToPlaylistButtonProps) => {
  const user = useUser();
  const addToMyList = useAddToMyList();

  const handleAddToMyList = async () => {
    if (!user) {
      toast.error("Please sign in to add to your list");
      return;
    }

    try {
      await addToMyList.mutateAsync(seriesId);
    } catch (error) {
      console.error("Error adding to list:", error);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleAddToMyList}
      disabled={addToMyList.isPending}
    >
      {addToMyList.isSuccess ? (
        <BookmarkMinus size={16} />
      ) : (
        <Bookmark size={16} />
      )}
      {addToMyList.isPending ? "Adding..." : "My List"}
    </Button>
  );
};

export const AddToMyListButton = () => {
  const { onOpen } = useWatchlistModal();

  return (
    <Button variant="outline" onClick={onOpen}>
      <Bookmark size={16} />
      My List
    </Button>
  );
};
