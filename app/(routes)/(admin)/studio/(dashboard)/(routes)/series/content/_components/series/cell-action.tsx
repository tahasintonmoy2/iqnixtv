"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getError } from "@/lib/get-error-message";
import axios from "axios";
import { Edit, Eye, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SeriesColumn } from "./columns";

interface CellActionProps {
  data: SeriesColumn;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const promise = () => new Promise((resolve) => setTimeout(resolve, 600));

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/season/${data}`);
      toast.promise(promise, {
        loading: "Please wait few minutes",
        success: () => {
          return "Series deleted";
        },
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error(getError(error));
    } finally {
      setIsLoading(false);
      //   onClose();
    }
  };

  return (
    <>
      {/* <DeleteGenre data={data} isLoading={isLoading} onConfirm={onDelete} /> */}
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
            onClick={onDelete}
          >
            <Trash className="size-4 mr-2 text-red-600" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
