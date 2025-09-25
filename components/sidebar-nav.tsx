"use client"

import {
  BarChart3,
  CreditCard,
  Film,
  Home,
  Image,
  Library,
  ListVideo,
  Settings, Tags,
  Upload,
  User,
  Users
} from "lucide-react";

import { SidebarItem } from "./sidebar-item";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/studio"
  },
  {
    label: "Series",
    icon: ListVideo,
    href: "/studio/series/content"
  },
  {
    label: "Movies",
    icon: Film,
    href: "/studio/movies"
  },
  {
    label: "Cast",
    icon: User,
    href: "/studio/cast"
  },
  {
    label: "Library",
    icon: Library,
    href: "/studio/library"
  },
  {
    label: "Categories",
    icon: Tags,
    href: "/studio/categories"
  },
  {
    label: "Banners",
    icon: Image,
    href: "/studio/banners"
  },
  {
    label: "Uploads",
    icon: Upload,
    href: "/studio/uploads"
  },
  {
    label: "Users",
    icon: Users,
    href: "/studio/users"
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/studio/billing"
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/studio/analytics"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/studio/settings"
  },
]

export const SidebarRoutes = () => {
  const isMobile = useMobile();
  const pathname = usePathname();

  return (
    <div className={cn("flex-col w-full", isMobile ? "hidden" : "flex")}>
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
          isActive={route.href === pathname}
        />
      ))}
    </div>
  );
};
