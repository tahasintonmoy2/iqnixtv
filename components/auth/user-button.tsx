"use client";

import { CreditCard, LogOut, PlayCircle, User } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";

import { signOut } from "@/actions/sign-out";
import Link from "next/link";

export const UserProfileButton = () => {
  const user = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={user?.image || `https://avatar.vercel.sh/${user?.name}.png`}
          />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        side="bottom"
        align="end"
        sideOffset={12}
      >
        <div className="flex flex-col items-start gap-x-4">
          <DropdownMenuLabel className="flex items-center">
            <p className="mr-2">{user?.firstName}</p>
            <p>{user?.lastName}</p>
          </DropdownMenuLabel>
          <p className="text-sm text-muted-foreground pr-4 pl-2">
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/u/${user?.id}`}>
            <DropdownMenuItem>
              <User className="size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <CreditCard className="size-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          {user?.role === "ADMIN" && (
            <Link href="/studio">
              <DropdownMenuItem>
                <PlayCircle className="size-4" />
                <span>Studio</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
