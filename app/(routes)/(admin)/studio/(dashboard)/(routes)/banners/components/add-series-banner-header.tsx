"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { useCreateBannerSeries } from "@/hooks/use-create-series-banner";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export const AddSeriesBannerHeader = () => {
  const { onOpen } = useCreateBannerSeries();

  return (
    <DashboardHeader
    heading="Banner Management"
    text="Create and manage promotional banners for your content platform"
    >
      <div className="flex items-center gap-x-3">
        <Link href="/studio/series/content">
          <Button variant="outline">
            Go to overivew
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Button onClick={onOpen}>
          <Plus className="size-4" />
          Add Banner
        </Button>
      </div>
    </DashboardHeader>
  );
};
