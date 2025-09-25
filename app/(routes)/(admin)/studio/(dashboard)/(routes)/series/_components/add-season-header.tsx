"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useCreateSeason } from "@/hooks/use-create-season";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export const AddSeasonHeader = () => {
  const { onOpen } = useCreateSeason();

  return (
    <DashboardHeader
      heading="Series Management"
      text="Manage your series, seasons, and episodes"
    >
      <div className="flex items-center gap-x-3">
        <Link href="/studio/series/content">
          <Button variant="outline">
            Go to overivew
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          Add Season
        </Button>
      </div>
    </DashboardHeader>
  );
};
