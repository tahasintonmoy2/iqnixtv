"use client";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CellAction } from "./cell-action";

export type SeasonColumn = {
  id: string;
  name: string;
  description: string | null;
  releaseDate: Date | null;
  seasonNumber: string;
  trailerVideoUrl: string | null;
  regions: string | null;
  thumbnailImageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<SeasonColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">{row.original.description}</div>
    ),
  },
  {
    accessorKey: "releaseDate",
    header: "Release Date",
    cell: ({ cell }) =>
      format(new Date(cell.getValue() as string), "MMM dd, yyyy"),
  },
  {
    accessorKey: "seasonNumber",
    header: "Season number",
  },
  // {
  //   accessorKey: "regions",
  //   header: "Region",
  //   cell: ({ row }) => (
  //     <div className="max-w-[100px] truncate">
  //       {row.original.regions}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "isPublished",
    header: "Published",
    cell: ({ row }) => (
      <Badge className="max-w-[100px] truncate">
        {row.original.isPublished ? "Published" : "Unpublished"}
      </Badge>
    )
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
