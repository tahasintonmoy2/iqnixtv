"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean
}

export const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <a
      href={href}
      className={cn(
      "group flex items-center gap-x-2 text-slate-600 dark:text-slate-300 dark:hover:text-slate-200 text-sm font-[500] pl-4 transition-all duration-200 ease-in-out hover:text-slate-600 hover:bg-slate-400/25 rounded-r-lg",
      isActive
        ? "text-slate-300 dark:text-white bg-primary hover:bg-primary hover:text-secondary"
        : "dark:hover:bg-card"
      )}
    >
      <div className="flex items-center gap-x-4 dark:text-slate-300 py-3">
      <Icon
        className={cn(
        "text-slate-400 size-4 dark:group-hover:text-slate-200 transition-colors duration-200 ease-in-out",
        isActive && "text-white"
        )}
      />
      <p
        className={cn(
        "text-slate-400 size-4 dark:group-hover:text-slate-200 transition-colors duration-200 ease-in-out",
        isActive && "text-white"
        )}
      >
        {label}
      </p>
      </div>
    </a>
  );
};
