"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as z from "zod";

import { FileUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import { MuxData, Trailers } from "@/lib/generated/prisma";
import "@mux/mux-player-react/themes/news";
import { PencilIcon, Plus, VideoIcon, X } from "lucide-react";
import Player from "next-video/player";
import { toast } from "sonner";

interface TrailerVideoFormPops {
  initialData: Trailers & { muxData?: MuxData | null };
  trailerId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  videoUrl: z.string(),
});

export const TrailerVideoForm = ({
  initialData,
  trailerId,
}: TrailerVideoFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/series/trailer/${trailerId}`,
        values
      );
      toast.success("Trailer video uploaded");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload video");
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mt-6 border bg-card rounded-md p-4">
      <div className="font-medium flex items-center justify-between mb-3">
        Trailer Video
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing && (
            <>
              <X className="size-5" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.videoUrl && (
            <>
              <Plus className="size-4" />
              Add an Video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <PencilIcon className="size-4" />
              Change Video
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className="flex justify-center items-center h-60 bg-slate-200 dark:bg-secondary rounded-md">
            <VideoIcon className="h-10 w-10 text-slate-600 dark:text-muted-foreground" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2 overflow-hidden rounded-lg">
            <Player
              playbackId={initialData?.muxData?.playbackId || ""}
              // title={initialData.name}
              className="aspect-video"
            />
          </div>
        ))}
      {isEditing && (
        <div className="rounded-lg border border-dashed p-4">
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg p-8">
            <FileUpload
              endPoint="trailerVideo"
              onChange={(url) => {
                if (url) {
                  onSubmit({ videoUrl: url });
                }
              }}
            />
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  );
};
