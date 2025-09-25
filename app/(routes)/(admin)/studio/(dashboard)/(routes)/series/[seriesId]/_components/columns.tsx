"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CastColumn = {
  id: string;
  name: string;
  image: string;
  bio: string | null;
  height: string | null;
  weight: string | null;
  age: string;
  gender: string;
  region: string;
  career: string;
  seasonId: string;
  alsoKnownAs: string | null;
  dateOfBirth: Date | null;
  isFeatured: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export const column: ColumnDef<CastColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <Image
            src={row.original.image || ""}
            alt="actress image"
            width={30}
            height={30}
            className="rounded-sm"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "alsoKnownAs",
    header: "Also known as",
  },
  {
    accessorKey: "bio",
    header: "Introduction",
    cell: ({ row }) => {
      return <p className="truncate">{row.original.bio || ""}</p>;
    },
  },
  {
    accessorKey: "height",
    header: "Height",
  },
  {
    accessorKey: "weight",
    header: "Weight",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender,
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      return row.original.dateOfBirth ? (
        <p>{format(row.original.dateOfBirth, "do MMM, yyyy")}</p>
      ) : (
        <p className="text-muted-foreground">Not specified</p>
      );
    },
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "career",
    header: "Career",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => {
      const isFeatured = row.getValue("isFeatured") || false;
      return (
        <Badge
        className={cn(
          "bg-slate-500 hover:bg-slate-500/80",
          isFeatured && "bg-primary hover:bg-primary/80"
        )}
        >
          {isFeatured ? "Featured" : "Unfeatured"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return <p>{format(row.original.createdAt, "do MMM, yyyy")}</p>;
    },
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
