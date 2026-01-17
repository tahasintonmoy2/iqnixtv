"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserProfileButton } from "./auth/user-button";
import Logo from "./logo";
import { NavRoutes } from "./nav-routes";
import { SearchButton } from "./search-button";
import { SubscriptionButtonClient } from "./subscription-button-client";

export const Navbar = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  console.log("User id:", user?.id);

  return (
    <>
      <nav
        className={cn(
          "fixed z-50 h-18 navbar-width flex items-center px-4 justify-between",
          isScrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="flex">
          <Logo href="/" />
          <NavRoutes />
        </div>
        <div className={cn("flex justify-between gap-x-2 lg:ml-62 ml-4")}>
          <div className="flex items-center gap-x-4">
            <SearchButton />
            <div className="lg:block hidden">
              <SubscriptionButtonClient />
            </div>
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
