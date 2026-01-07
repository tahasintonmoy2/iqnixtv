import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";
import { Badge } from "./ui/badge";

interface ActionHintProps {
  children: React.ReactNode;
  label: string;
  side?: "left" | "right" | "top" | "bottom";
  sideOffset?: number;
  shortcutKey?: string;
  asChild?: boolean;
  className?: string;
}

export const ActionHint = ({
  children,
  label,
  side = "top",
  sideOffset = 10,
  shortcutKey,
  asChild,
  className,
}: ActionHintProps) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
          <TooltipContent
            side={side}
            sideOffset={sideOffset}
            className={cn(
              "bg-black/60 backdrop-blur-sm flex items-center gap-x-2 text-white transition-colors font-semibold mx-2",
              className
            )}
          >
            {label}
            {shortcutKey && <Badge variant="outline">{shortcutKey}</Badge>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
