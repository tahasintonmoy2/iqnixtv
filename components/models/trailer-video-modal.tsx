"use client";

import { useTrailerVideo } from "@/hooks/use-trailer-video";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Player from "next-video/player";

interface TrailerVideoModalProps {
  playbackId: string;
  posterUrl: string;
}

export const TrailerVideoModal = ({
  playbackId,
  posterUrl,
}: TrailerVideoModalProps) => {
  const { isOpen, onClose } = useTrailerVideo();

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 rounded-xl border-muted border-2 overflow-hidden lg:h-[27rem] lg:max-w-3xl">
          <Player
            src={`https://stream.mux.com/${playbackId}.m3u8`}
            poster={posterUrl}
            className="overflow-hidden rounded-xl"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
