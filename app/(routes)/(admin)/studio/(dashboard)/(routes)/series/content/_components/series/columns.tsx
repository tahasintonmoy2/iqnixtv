"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CellAction } from "./cell-action";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export type SeriesColumn = {
  id: string;
  name: string;
  description: string | null;
  releaseDate: Date | null;
  genre: string[];
  contentRegion: string | null;
  contentLanguage: string[] | null;
  thumbnailImageUrl: string | null;
  ageRating: string[] | null;
  allowedRegion: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<SeriesColumn>[] = [
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
    accessorKey: "genre",
    header: "Genre",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">{row.original.genre}</div>
    ),
  },
  {
    accessorKey: "contentRegion",
    header: "Content Region",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">
        {row.original.contentRegion}
      </div>
    ),
  },
  {
    accessorKey: "contentLanguage",
    header: "Content Language",
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">
        {row.original.contentLanguage}
      </div>
    ),
  },
  {
    accessorKey: "ageRating",
    header: "Age Rating",
    cell: ({ row }) => (
      <Badge className="max-w-[100px] truncate">
        {row.original.ageRating}
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
