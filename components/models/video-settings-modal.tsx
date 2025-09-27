import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useVideoSettingsModal } from "@/hooks/use-video-settings-modal";
import { ChevronRight, Clock, Gauge, Subtitles } from "lucide-react";
import { Button } from "../ui/button";
import { MdOutlineRecordVoiceOver } from "react-icons/md";

export const VideoSettingsModal = () => {
  const { isOpen, onClose } = useVideoSettingsModal();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="my-3">
          <Button
            variant="ghost"
            // onClick={() => navigateTo("subtitles")}
            className="w-full flex items-center justify-between hover:bg-white/15 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Subtitles className="size-5" />
              <span className="text-sm">Subtitles</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <span>Off</span>
              <ChevronRight className="size-5" />
            </div>
          </Button>
          <Button
            variant="ghost"
            // onClick={() => navigateTo("audio")}
            className="w-full flex items-center justify-between hover:bg-white/15 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <MdOutlineRecordVoiceOver className="size-5" />
              <span className="text-sm">Audio</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <span>Korean</span>
              <ChevronRight className="size-5" />
            </div>
          </Button>

          <Button
            variant="ghost"
            // onClick={() => navigateTo("speed")}
            className="w-full flex items-center justify-between hover:bg-white/15 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Clock className="size-5" />
              <span className="text-sm">Playback speed</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              {/* <span>
                {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
              </span> */}
              <ChevronRight className="size-5" />
            </div>
          </Button>

          <Button
            variant="ghost"
            // onClick={() => navigateTo("quality")}
            className="w-full flex items-center justify-between hover:bg-white/15 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Gauge className="size-5" />
              <span className="text-sm">Quality</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              {/* <span>{quality === "auto" ? "Auto (480p)" : `${quality}p`}</span> */}
              <ChevronRight className="size-5" />
            </div>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
