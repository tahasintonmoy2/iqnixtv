import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscriptions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserProfileButton } from "./auth/user-button";
import Logo from "./logo";
import { NavRoutes } from "./nav-routes";
import { SearchButton } from "./search-button";
import SubscriptionButton from "./subscription-button";

export const Navbar = async () => {
  const user = await currentUser();
  const isPro = await checkSubscription();

  return (
    <>
      <nav className="fixed z-50 h-16 navbar-width flex items-center px-4 justify-between backdrop-blur-lg bg-black/5 dark:bg-black/20">
        <div className="flex">
          <Logo href="/" />
          <NavRoutes />
        </div>
        <div className={cn("flex justify-between gap-x-2 lg:ml-62 ml-4")}>
          <div className="flex items-center gap-x-4">
            <SearchButton />
            <div className="lg:block hidden">
              <SubscriptionButton isPro={isPro} />
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
