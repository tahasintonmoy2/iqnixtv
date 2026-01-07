"use client";

import { Button } from "@/components/ui/button";
import { useCreateThreads } from "@/hooks/use-create-threads";
import { Plus } from "lucide-react";
import React from "react";

export const EmptyThreadsState = () => {
  const { onOpen } = useCreateThreads();

  return (
    <div className="mx-auto px-4 py-6 pt-28">
      <div className="text-center">
        <h1 className="text-2xl font-bold">No threads found in this forum</h1>
        <p className="text-muted-foreground mb-4">
          Be the first to start a new thread!
        </p>
        <Button onClick={onOpen}>
          <Plus className="size-4" />
          Start New Thread
        </Button>
      </div>
    </div>
  );
};
