"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCommentModal } from "@/hooks/use-delete-comment-modal";
import { Edit, MoreVertical, Trash } from "lucide-react";

interface CommentActionProps {
  setIsEdit: (isOpen: boolean) => void;
  commentId: string;
}

export const CommentAction = ({ setIsEdit, commentId }: CommentActionProps) => {
  const { onOpen } = useDeleteCommentModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-transparent cursor-pointer">
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsEdit(true)}>
          <Edit className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:!bg-red-600/30 text-red-600 hover:!text-red-600"
          onClick={() => onOpen(commentId)}
        >
          <Trash className="size-4 text-red-600" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
