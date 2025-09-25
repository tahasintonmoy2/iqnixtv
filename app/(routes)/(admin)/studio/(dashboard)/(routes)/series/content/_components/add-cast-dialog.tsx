"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCastModal } from "@/hooks/use-cast-modal";
import { Cast } from "@/lib/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

interface AddCastDialogProps {
  casts: Cast[];
  onContinue?: (selectedCasts: Cast[]) => void;
}

export const AddCastDialog = ({ casts, onContinue }: AddCastDialogProps) => {
  const { isOpen, onClose } = useCastModal();
  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedCasts);
    }
    onClose();
    setSelectedCasts([]); // Reset selection after continuing
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pt-5 pb-4">
            <DialogTitle>New cast</DialogTitle>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="Search cast..." />
            <CommandList>
              <CommandEmpty>No casts found.</CommandEmpty>
              <CommandGroup>
                {casts.map((cast) => (
                  <CommandItem
                    key={cast.id}
                    data-active={selectedCasts.includes(cast)}
                    className="data-[active=true]:opacity-50"
                    onSelect={() => {
                      if (selectedCasts.includes(cast)) {
                        return setSelectedCasts(
                          selectedCasts.filter(
                            (selectedCast) => selectedCast !== cast
                          )
                        );
                      }

                      return setSelectedCasts(
                        [...casts].filter((u) =>
                          [...selectedCasts, cast].includes(u)
                        )
                      );
                    }}
                  >
                    <Avatar className="size-8 rounded-full overflow-hidden">
                      <AvatarImage src={cast.image} alt="Image" />
                      <AvatarFallback className="uppercase">
                        {cast.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm leading-none font-medium">
                        {cast.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {cast.career}
                      </p>
                    </div>
                    {selectedCasts.includes(cast) ? (
                      <CheckIcon className="text-primary ml-auto flex size-4" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
            {selectedCasts.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {selectedCasts.map((cast) => (
                  <Avatar key={cast.id} className="inline-block size-8 rounded-full overflow-hidden">
                    <AvatarImage src={cast.image} />
                    <AvatarFallback>{cast.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Select casts to add to this thread.
              </p>
            )}
            <Button 
              disabled={selectedCasts.length < 1} 
              size="sm"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
