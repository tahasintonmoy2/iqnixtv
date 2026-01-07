"use client";

import { DeleteSeriesModel } from "@/components/models/delete-series-model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteSeriesModal } from "@/hooks/use-delete-series";
import { Edit, Eye, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { TrailerColumn } from "./columns";

interface CellActionProps {
  data: TrailerColumn;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const {onOpen} = useDeleteSeriesModal();

  return (
    <>
      <DeleteSeriesModel />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:ring-transparent focus:outline-none">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/studio/series/content/${data.id}`)}
          >
            <Edit className="size-4 mr-2" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/studio/series/${data.id}`)}
          >
            <Eye className="size-4 mr-2" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:!bg-red-500/40 hover:!text-red-600"
            onClick={()=> onOpen(data.id)}
          >
            <Trash className="size-4 mr-2 text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
