import { SeriesBannerTitleForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/banners/[bannerId]/_components/banner-title-form";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { BannerDescriptionForm } from "./_components/banner-description-form";
import { SeriesImageForm } from "./_components/banner-image-form";
import { SeriesRegionForm } from "./_components/banner-region-form";
import { ContentAction } from "./_components/content-action";
import { SelectBannerTypeForm } from "./_components/select-banner-type-form";
import { SelectSeriesForm } from "./_components/select-series-form";

interface BannerIdPageProps {
  params: Promise<{ bannerId: string }>;
}

const BannerIdPage = async ({ params }: BannerIdPageProps) => {
  const { bannerId } = await params;
  const banner = await db.seriesBanner.findUnique({
    where: {
      id: bannerId,
    },
  });

  const series = await db.series.findMany({
    where: {
      isPublished: true,
    },
    include: {
      genre: true,
    },
  });

  if (!banner?.id) {
    throw new Error("Series banner not found");
  }

  const requiredFields = [
    banner.name,
    banner.description,
    banner.region,
    banner.type,
    banner.bannerImageUrl,
    banner.seriesId,
  ];

  const bannerTypeOptions = [
    { name: "Image Banner", value: "IMAGE_BANNER" },
    { name: "Video Banner", value: "VIDEO_BANNER" },
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `${completedFields} / ${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      <div className="flex flex-col items-end mb-4">
        {!banner.isPublished && (
          <Banner
            variant="warning"
            label="This series banner is now unpublished. It will not be visible in the platform"
          />
        )}
        {banner.isPublished && (
          <Banner
            variant="success"
            label="This series banner is now published. It will be visible in the platform"
          />
        )}
        <ContentAction
          banner={banner}
          bannerId={bannerId}
          isComplete={isComplete}
        />
      </div>
      <Card className="mb-4 py-4">
        <CardHeader>
          <CardTitle>
            {banner?.id ? "Edit Series banner" : "Create New Series banner"}
          </CardTitle>
          <CardDescription>
            {banner?.id
              ? "Update your promotional banner settings and content."
              : "Create a new promotional banner for your content platform."}
            <p className="mt-2 text-muted-foreground">
              Complete all fields {completionText}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="media">Metadata & Media</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <SeriesBannerTitleForm
                      initialData={banner}
                      bannerId={bannerId}
                    />
                  </div>
                  <div className="space-y-2">
                    <BannerDescriptionForm
                      initialData={banner}
                      bannerId={bannerId}
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <SelectSeriesForm
                      initialData={banner}
                      bannerId={bannerId}
                      options={series.map((seri) => ({
                        name: seri.name,
                        value: seri.id,
                        type: seri.type,
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <SelectBannerTypeForm
                      initialData={banner}
                      bannerId={bannerId}
                      options={bannerTypeOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4"></div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="space-y-2">
                  <SeriesImageForm initialData={banner} bannerId={bannerId} />
                </div>

                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <SeriesRegionForm
                      initialData={banner}
                      bannerId={bannerId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overlayText">Overlay Text</Label>
                    <Input placeholder="Text to overlay on banner" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Call-to-Action Text</Label>
                    <Input placeholder="e.g., Watch Now, Learn More" />
                  </div>
                </div>

                {banner.type === "VIDEO_BANNER" && (
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label htmlFor="autoPlay">Auto-play video</Label>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal"
                          )}
                        >
                          <span>Pick a date</span>
                        </Button>
                      </PopoverTrigger>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal"
                          )}
                        >
                          <span>Pick a date</span>
                        </Button>
                      </PopoverTrigger>
                    </Popover>
                  </div>
                </div>

                <Card className="py-4">
                  <CardHeader>
                    <CardTitle>Schedule Summary</CardTitle>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BannerIdPage;
