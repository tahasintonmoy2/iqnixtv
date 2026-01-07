"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useCreateTrailer } from "@/hooks/use-create-trailer";
import { Plus } from "lucide-react";

export const AddTrailerHeader = () => {
  const { onOpen } = useCreateTrailer();

  return (
    <DashboardHeader
      heading="Trailer Management"
      text="Manage your trailers and teasers for series and movies."
    >
      <div className="flex items-center gap-x-3">
        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          Add New
        </Button>
      </div>
    </DashboardHeader>
  );
};
