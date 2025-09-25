"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useCreateSeries } from "@/hooks/use-create-series";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export const AddLibraryHeader = () => {
  const { onOpen } = useCreateSeries();

  return (
    <DashboardHeader
      heading="Content Library"
      text="Browse and manage your entire content library"
    >
      <div className="flex items-center gap-x-3">
        <Link href="/series/content">
          <Button variant="outline">
            Go to overivew
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          Add Content
        </Button>
      </div>
    </DashboardHeader>
  );
};
