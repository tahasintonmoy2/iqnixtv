"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";
import React from "react";

export const NetworkIndicator = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full">
      <div
        className={cn(
          " border-t border-b text-center p-1 text-sm flex items-center mb-1.5",
          isOnline
            ? "bg-green-600/30 border-green-600 text-green-500"
            : "bg-yellow-600/40 border-yellow-600 text-yellow-500"
        )}
      >
        {isOnline ? (
          <div className="flex items-center gap-x-1">
            <Info className="size-5" />
            <p className="mt-[0.2rem]">Back to Online</p>
          </div>
        ) : (
          <div className="flex items-center gap-x-1">
            <AlertTriangle className="size-5" />
            <p className="mt-[0.2rem]">
              Offline - Please check your connection
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
