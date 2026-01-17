import { cn } from "@/lib/utils";
import { Anta } from "next/font/google";
import Link from "next/link";

interface LogoProps {
  href: string;
  className?: string;
}

const txtFont = Anta({
  subsets: ["latin"],
  weight: ["400"]
})

const Logo = ({ href, className }: LogoProps) => {
  return (
    <div>
      <Link
        href={href}
        className={cn("flex items-center w-30 gap-x-2 font-semibold", className)}
      >
        <h1 className={cn("font-semibold lg:text-2xl text-xl uppercase dark:text-white", txtFont.className)}>
          <p>Koiqnix</p>
        </h1>
      </Link>
    </div>
  );
};

export default Logo;