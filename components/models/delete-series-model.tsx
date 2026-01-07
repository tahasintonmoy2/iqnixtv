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
import { useDeleteSeriesModal } from "@/hooks/use-delete-series";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export const DeleteSeriesModel = () => {
  const { isOpen, onClose, id } = useDeleteSeriesModal();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (productId: string) => {
    try {
      setLoading(true);

      await axios.delete(`/api/series/${productId}`);
      window.location.reload();
      onClose();
      toast.success("Series deleted!");
    } catch (error) {
      console.log("ID: ", productId);
      console.log(error);
      setLoading(false);
      toast.error("Failed to delete product, Please try agin");
    } finally {
      setLoading(false);
    }
  };

  console.log("Prod Id: ", id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            ProductId <span className="bg-muted rounded">{id}</span>
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
