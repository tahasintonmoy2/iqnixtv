import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { BannerAnalytics } from "../series/_components/banner-analytics";
import { BannersList } from "../series/_components/banners-list";

export default async function BannersPage() {
  const banners = await db.seriesBanner.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      series: true,
      genre: true,
    },
  });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Banner Management"
        text="Create and manage promotional banners for your content platform"
      />

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <BannersList
            banners={banners.map((banner) => ({
              ...banner,
              series: banner.series ? [banner.series] : [],
              genre: banner.genre ? [banner.genre] : [],
              analytics: {
                impressions: 0,
                ctr: 0,
                clicks: 0,
              },
            }))}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <BannerAnalytics />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
