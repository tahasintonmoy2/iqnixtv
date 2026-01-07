"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useMobile } from "@/hooks/use-mobile";
import { useWatchlistModal } from "@/hooks/use-watchlist-modal";
import { Playlist, PlaylistContent, Series } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ListVideo, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

interface PlaylistThumbnailProps {
  playlist: Playlist & {
    series: Series[];
  };
  size?: number;
}

const PlaylistThumbnail = ({ playlist, size = 40 }: PlaylistThumbnailProps) => {
  const seriesImages = playlist.series
    .map((content) => content.thumbnailImageUrl)
    .filter(Boolean)
    .slice(0, 4);

  if (seriesImages.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ width: size, height: size }}
      >
        <ListVideo className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (seriesImages.length === 1) {
    return (
      <Image
        src={seriesImages[0] || ""}
        alt="Playlist thumbnail"
        width={size}
        height={size}
        className="rounded object-cover"
      />
    );
  }

  const gridSize = size / 2;
  return (
    <div
      className="grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden"
      style={{ width: size, height: size }}
    >
      {seriesImages.slice(0, 4).map((image, index) => (
        <Image
          key={index}
          src={image || ""}
          alt={`Series ${index + 1}`}
          className="object-cover"
          width={gridSize}
          height={gridSize}
        />
      ))}
    </div>
  );
};

interface AddWatchlistModalProps {
  playlists: (Playlist & {
    series: Series[];
    contents: PlaylistContent[];
  })[];
  playlistId: string;
  seriesId: string;
}

export function AddWatchlistModal({
  playlists,
  playlistId,
  seriesId,
}: AddWatchlistModalProps) {
  const { isOpen, onClose } = useWatchlistModal();
  const isMobile = useMobile();
  const router = useRouter();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [isCreatePlaylist, setIsCreatePlaylist] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/playlists", {
        name: values.name,
        seriesId,
      });

      toast.success("Playlist has been created!");
      form.reset();
      router.refresh();
      setIsCreatePlaylist((curr) => !curr);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create playlist");
    }
  };

  const {user} = useAuth();

  const selectedPlaylistName = playlists.find(
    (p) => p.id === selectedPlaylist
  )?.name;

  const handleAddToMyList = async () => {
    if (!user) {
      toast.error("Please sign in to add to your list");
      return;
    }

    try {
      if (selectedPlaylist !== playlistId) {
        await axios.patch(`/api/playlists/${playlistId}`, {
          seriesId,
        });

        toast.success(`Added to ${selectedPlaylistName}`);
        router.refresh();
        onClose();
      } else {
      }
    } catch (error) {
      console.error("Error adding to list:", error);
    }
  };

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={selectedPlaylist}
              onValueChange={setSelectedPlaylist}
            >
              {playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={playlist.id} id={playlist.id} />
                  <label
                    htmlFor={playlist.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="rounded-lg hover:bg-secondary p-1.5">
                      <div className="flex items-center">
                        <PlaylistThumbnail playlist={playlist} />
                        <div>
                          <h1 className="text-lg font-semibold ml-2">
                            {playlist.name}
                          </h1>
                          <p className="text-sm text-muted-foreground ml-2">
                            {playlist.itemCount} items
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </RadioGroup>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {isCreatePlaylist ? (
                  <div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Give your playlist a name"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-start">
                    <Separator className="my-2" />
                    <div
                      className="flex items-center gap-x-3 cursor-pointer w-full"
                      onClick={() => setIsCreatePlaylist((curr) => !curr)}
                    >
                      <div className="flex items-center justify-center bg-muted rounded-lg size-10">
                        <Plus className="size-6 text-muted-foreground" />
                      </div>
                      Create new playlist
                    </div>
                    <Separator className="my-2" />
                  </div>
                )}
                {isCreatePlaylist ? (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatePlaylist((curr) => !curr)}
                    >
                      Close
                    </Button>
                    <Button disabled={isSubmitting || !isValid}>
                      {isSubmitting ? <p>Creating</p> : <p>Create</p>}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      onClick={handleAddToMyList}
                      disabled={!selectedPlaylist}
                    >
                      Add to Playlist
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add to your playlist</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <RadioGroup
            value={selectedPlaylist}
            onValueChange={setSelectedPlaylist}
          >
            {playlists.map((playlist) => (
              <div key={playlist.id} className="flex items-center space-x-2">
                <RadioGroupItem value={playlist.id} id={playlist.id} />
                <Label htmlFor={playlist.id} className="flex-1 cursor-pointer">
                  <div className="rounded-lg hover:bg-secondary p-1.5">
                    <div className="flex items-center">
                      <PlaylistThumbnail playlist={playlist} />
                      <div>
                        <h1 className="text-lg font-semibold ml-2">
                          {playlist.name}
                        </h1>
                        <p className="text-sm text-muted-foreground ml-2">
                          {playlist.itemCount} items
                        </p>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DrawerFooter className="pt-2">
          <div className="flex space-x-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              onClick={handleAddToMyList}
              disabled={!selectedPlaylist}
              className="flex-1"
            >
              Add to Playlist
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
