"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CellAction } from "./cell-action";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TrailerColumn = {
  id: string;
  name: string;
  thumbnailImageUrl: string | null;
  type: string | null;
  videoUrl: string | null;
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<TrailerColumn>[] = [
  {
    accessorKey: "thumbnailImageUrl",
    header: "Thumbnail",
    cell: ({ row }) => (
      <Image
        src={row.original.thumbnailImageUrl ?? ""}
        alt={row.original.name}
        className="rounded object-cover"
        width={30}
        height={30}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">{row.original.type}</div>
    ),
  },
  {
    accessorKey: "videoUrl",
    header: "Video",
    cell: ({ row }) => (
      <Badge className="max-w-[100px] truncate">
        {row.original.videoUrl?.length ? row.original.videoUrl : "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Published",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;

      return (
        <Badge
          className={cn(
            "bg-secondary hover:bg-secondary/70",
            isPublished && "bg-primary hover:bg-primary/80"
          )}
        >
          {isPublished ? "Published" : "Unpublished"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ cell }) =>
      format(new Date(cell.getValue() as string), "MMM dd, yyyy"),
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
