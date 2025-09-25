"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Genre, Series, SeriesBanner } from "@/lib/generated/prisma";
import { Edit, Eye, MoreHorizontal, Pause, Play, Plus } from "lucide-react";
import { useState } from "react";
import { AddBannerDialog } from "./add-banner-dialog";
import { useCreateBannerSeries } from "@/hooks/use-create-series-banner";
import { useRouter } from "next/navigation";

interface AddBannerDialogProps {
  banners: (SeriesBanner & {
    series: Series[];
    genre: Genre[];
    analytics: {
      impressions: number;
      clicks: number;
      ctr: number;
    };
  })[];
}

export const BannersList = ({ banners }: AddBannerDialogProps) => {
  const { onOpen } = useCreateBannerSeries();
  const router = useRouter();
  const [selectedBanner, setSelectedBanner] = useState<SeriesBanner | null>(
    null
  );
  const [bannerList, setBannerList] = useState<typeof banners>(banners);

  const getStatusColor = (status: SeriesBanner["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "SCHEDULED":
        return "bg-blue-500";
      case "PAUSED":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: SeriesBanner["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "SCHEDULED":
        return "Scheduled";
      case "PAUSED":
        return "Paused";
      default:
        return "Unknown";
    }
  };

  const handleStatusToggle = (bannerId: string) => {
    setBannerList((prev) =>
      prev.map((banner) =>
        banner.id === bannerId
          ? {
              ...banner,
              status: banner.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
            }
          : banner
      )
    );
  };

  const handlePreview = (banner: SeriesBanner) => {
    setSelectedBanner(banner);
  };

  const handleEdit = (banner: SeriesBanner) => {
    setSelectedBanner(banner);
    onOpen();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banners</h2>
          <p className="text-muted-foreground">
            Manage promotional banners and featured content
          </p>
        </div>
        <Button onClick={onOpen}>
          <Plus className="mr-2 size-4" />
          Add Banner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Banners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bannerList.filter((b) => b.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bannerList
                .reduce((sum, b) => sum + b.analytics.impressions, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bannerList
                .reduce((sum, b) => sum + b.analytics.clicks, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                bannerList.reduce((sum, b) => sum + b.analytics.ctr, 0) /
                bannerList.length
              ).toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
          <CardDescription>
            Manage your promotional banners and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bannerList.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={banner.bannerImageUrl || ""} />
                    <AvatarFallback>
                      {banner.type === "VIDEO_BANNER" ? "📹" : "🖼️"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{banner.name}</h3>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(banner.status)} text-white`}
                      >
                        {getStatusLabel(banner.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Type: {banner.type}</span>
                      {banner.series && (
                        <span>Target: {banner.series[0].name}</span>
                      )}
                      <span>
                        {banner.analytics.impressions.toLocaleString()}{" "}
                        impressions
                      </span>
                      <span>
                        {banner.analytics.clicks.toLocaleString()} clicks
                      </span>
                      <span>{banner.analytics.ctr}% CTR</span>
                    </div>
                    {/* <div className="text-xs text-muted-foreground">
                      Active: {banner.startDate.toLocaleDateString()} - {banner.endDate.toLocaleDateString()}
                    </div> */}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/studio/banners/${selectedBanner?.id}`)
                        }
                      >
                        <Edit className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreview(banner)}>
                        <Eye className="mr-2 size-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusToggle(banner.id)}
                      >
                        {banner.status === "ACTIVE" ? (
                          <>
                            <Pause className="mr-2 size-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 size-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem onClick={() => handleDelete(banner.id)} className="text-red-600">
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddBannerDialog />

      {/* <BannerPreview open={showPreview} onOpenChange={setShowPreview} banner={selectedBanner} /> */}
    </>
  );
};
