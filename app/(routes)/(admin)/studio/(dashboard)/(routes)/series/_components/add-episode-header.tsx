"use client";

import { Button } from "@/components/ui/button";
import { useEpisode } from "@/hooks/use-episode";
import { Plus } from "lucide-react";

export const AddEpisodeHeader = () => {
  const {onOpen} = useEpisode()

  return (
    <Button
      onClick={onOpen}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Episode
    </Button>
  );
};
