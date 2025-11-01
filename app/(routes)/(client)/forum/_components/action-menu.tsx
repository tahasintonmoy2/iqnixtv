"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit3, MoreVertical, Trash } from "lucide-react";
import { toast } from "sonner";

interface CellActionProps {
  forumId: string;
}

export const ActionMenu = ({ forumId }: CellActionProps) => {
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  const url = origin;

  const baseUrl = `${url}/forum/${forumId}`;

  const onCopy = (id: string) => {
    if (!forumId || forumId === undefined) {
      toast.error("Failed to copy forum link");
      return;
    }
    navigator.clipboard.writeText(id);
    toast.success("Forum link copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-transparent focus:outline-none">
        <MoreVertical className="size-5 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onCopy(baseUrl)}>
          <Copy className="size-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit3 className="size-4" />
          Edit Forum
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:!bg-red-600/20 text-red-600 hover:!text-red-700">
          <Trash className="size-4 hover:!text-red-700 text-red-600" />
          Delete Forum
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
