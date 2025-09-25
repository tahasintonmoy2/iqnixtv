"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCast } from "@/hooks/use-delete-cast";
import { Cast } from "@/lib/generated/prisma";
import { Edit, MoreHorizontal, Trash, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CastColumn } from "./columns";
import { useCastMemberProfile } from "@/hooks/use-cast-member-profile";
// import { DeleteUser } from "@/components/models/delete-user";

interface CellActionProps {
  data: CastColumn & Cast;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const { onOpen } = useDeleteCast();
  const { onOpenCasProfile } = useCastMemberProfile();

  // const [loading, setLoading] = useState(false);

  return (
    <>
      {/* <DeleteUser data={data} isLoading={loading} onConfirm={() => {}} /> */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus-visible:ring-transparent focus:outline-none">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpenCasProfile}>
            <UserCircle className="size-4 mr-2" />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/cast")}>
            <Edit className="size-4 mr-2" />
            Update cast
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:!bg-red-500/40 hover:!text-red-600"
            onClick={() => onOpen(data.id)}
          >
            <Trash className="size-4 mr-2 text-red-600" />
            Delete cast
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
