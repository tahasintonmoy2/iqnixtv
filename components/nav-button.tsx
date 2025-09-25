import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavButtonProps {
  href: string;
  label: string;
  isActive: boolean;
}

export const NavButton = ({ href, label, isActive }: NavButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "w-full lg:w-auto justify-between hover:text-violet-500 transition-colors",
        isActive ? "text-violet-500" : "text-white"
      )}
    >
      {label}
    </Link>
  );
};
