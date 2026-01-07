"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAudioTrackModal } from "@/hooks/use-delete-audio-track";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const DeleteAudioTrackModel = () => {
  const { isOpen, onClose, id } = useDeleteAudioTrackModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (audioTrackId: string) => {
    try {
      setLoading(true);

      await axios.delete(`/api/series/multi-track-audio/${audioTrackId}`);
      router.refresh();
      onClose();
      toast.success("Audio track deleted!");
    } catch (error) {
      console.log("ID: ", audioTrackId);
      console.log(error);
      setLoading(false);
      toast.error("Failed to delete audioTrack, Please try agin");
    } finally {
      setLoading(false);
    }
  };

  console.log("Track Id: ", id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className="bg-red-600 hover:bg-red-600/70"
            disabled={loading}
            onClick={() => id && handleDelete(id)}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loader"></div>
                <p>Loading</p>
              </div>
            ) : (
              <p>Delete</p>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
