"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavButton } from "./nav-button";

const routes = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Drama",
    href: "/dramas",
  },
  {
    label: "Movies",
    href: "/movies",
  },
  {
    label: "Community",
    href: "/forum",
  },
  {
    label: "Explore",
    href: "/explore",
  },
];

export const NavRoutes = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <nav className="hidden w-full lg:flex items-center gap-x-4 overflow-y-auto">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={pathname === route.href}
        />
      ))}
    </nav>
  );
};