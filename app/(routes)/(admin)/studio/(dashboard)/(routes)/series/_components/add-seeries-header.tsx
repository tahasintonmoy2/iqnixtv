"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useCreateSeries } from "@/hooks/use-create-series";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export const AddSeriesHeader = () => {
  const { onOpen } = useCreateSeries();

  return (
    <DashboardHeader
      heading="Series Management"
      text="Manage your series, seasons, and episodes"
    >
      <div className="flex items-center gap-x-3">
        <Link href="/studio/series/content">
          <Button variant="outline">
            Go to overview
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          Add Series
        </Button>
      </div>
    </DashboardHeader>
  );
};
