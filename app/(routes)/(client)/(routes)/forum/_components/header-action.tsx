"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCommunity } from "@/hooks/use-create-community";
import { useRequestContent } from "@/hooks/use-request-content";
import { Plus, Search } from "lucide-react";
import React from "react";

export const HeaderAction = () => {
  const { onOpen } = useCreateCommunity();
  const request = useRequestContent();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search forum..." className="pl-10" />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={onOpen}>
          <Plus className="size-4" />
          New Discussion
        </Button>
        <Button variant="outline" size="sm" onClick={request.onOpen}>
          <Plus className="size-4" />
          Request
        </Button>
      </div>
    </div>
  );
};
