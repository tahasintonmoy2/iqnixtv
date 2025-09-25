"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDeleteReplyModal } from "@/hooks/use-delete-reply-modal";
import { useMobile } from "@/hooks/use-mobile";

interface ActionDialogProps {
  isLoading: boolean;
  onConfirm: () => void;
}

export const DeleteReplyModal = ({
  isLoading,
  onConfirm,
}: ActionDialogProps) => {
  const { isOpen, onClose } = useDeleteReplyModal();
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you sure?</DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete reply.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-600/70"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="loader"></div>
                  <p>Deleting...</p>
                </div>
              ) : (
                "Delete"
              )}
            </Button>
            <DrawerClose>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            reply
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-600/70"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="loader"></div>
                <p>Deleting...</p>
              </div>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
