"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosClient } from "@/lib/axios-client";
import { Series, SeriesBanner } from "@/types";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { IconFolderCode } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BannerAnalytics } from "../series/_components/banner-analytics";
import { BannersList } from "../series/_components/banners-list";
import { AddSeriesBannerHeader } from "./components/add-series-banner-header";
import { AddBannerDialog } from "../series/_components/add-banner-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useCreateBannerSeries } from "@/hooks/use-create-series-banner";

export default function BannersPage() {
  const [banners, setBanners] = useState<
    (SeriesBanner & { series?: Series | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { onOpen } = useCreateBannerSeries();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get("/series/banners");
        setBanners(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch banners"
        );
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <AddSeriesBannerHeader />
        <div className="mt-20 flex items-center justify-center">
          <div className="loader-lt"></div>
          <h1>Loading...</h1>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <AddSeriesBannerHeader />
        <div className="mt-20 flex items-center justify-center">
          <div className="flex max-w-96 items-center font-medium p-2 border text-red-600 border-red-500 bg-red-800/35 rounded-sm">
            <ExclamationTriangleIcon className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (banners.length === 0) {
    return (
      <DashboardShell>
        <AddSeriesBannerHeader />
        <AddBannerDialog />
        <div className="mt-20 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconFolderCode />
              </EmptyMedia>
              <EmptyTitle>No Banner Yet</EmptyTitle>
              <EmptyDescription>
                <h1 className="text-base font-semibold">
                  No series banner found.Get started by creating the first
                  banner.
                </h1>
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button onClick={onOpen}>Create Banner</Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <AddSeriesBannerHeader />

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <BannersList
            banners={
              banners.map((banner) => {
                const { series, ...rest } = banner;
                return {
                  ...rest,
                  series: series ? series : [],
                  analytics: {
                    impressions: 0,
                    ctr: 0,
                    clicks: 0,
                  },
                };
              }) as unknown as (SeriesBanner & {
                series: Series[];
                analytics: { impressions: number; clicks: number; ctr: number };
              })[]
            }
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <BannerAnalytics />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
