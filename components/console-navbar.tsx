"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserProfileButton } from "./auth/user-button";
import Logo from "./logo";
import { ThemeToggle } from "./theme-toggle";

export const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {user} = useAuth();

  const isDesktop = useMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <nav className="fixed z-50 h-16 border navbar-width flex items-center px-4 justify-between backdrop-blur-lg">
        <Logo href="/"/>
        <div
          className={cn(
            "items-center gap-x-4",
            isDesktop ? "lg:flex" : "hidden"
          )}
        >
          {/* <SearchInput /> */}
        </div>
        <div
          className={cn(
            "flex justify-between gap-x-2",
            isDesktop ? "ml-72" : "ml-4"
          )}
        >
          <div className={cn("", isDesktop ? "hidden" : "block")}>
            {/* {!isPro && (
            <SubscriptionButton isPro={isPro} />
          )} */}
            {/* <MobileSidebar /> */}
          </div>
          <div className="flex items-center gap-x-2">
            <ThemeToggle />
            {user?.id ? (
                <UserProfileButton />
            ) : (
              <Link href="/auth/sign-in">
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};