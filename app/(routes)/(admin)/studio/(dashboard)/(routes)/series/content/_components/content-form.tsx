import { Label } from "@/components/ui/label";

import { SeriesCastDescriptionForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/content/_components/content-cast-description-form";
import { SelectSeasonForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/content/_components/select-season-form";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import {
  ContentLanguage,
  Episode,
  Genre,
  Season,
  Series,
} from "@/lib/generated/prisma";
import { Plus, Upload } from "lucide-react";
import { ContentAction } from "./content-action";
import { ContentAgeRatingForm } from "./content-age-rating-form";
import { SeriesDescriptionForm } from "./content-description-form";
import { SeriesImageForm } from "./content-image-form";
import { ContentLanguageForm } from "./content-language-select-form";
import { SeriesRegionForm } from "./content-region-form";
import { SeriesReleaseForm } from "./content-release-form";
import { ContentGenresForm } from "./content-select-genre-form";
import { SeriesTitleForm } from "./content-title-form";
import { SeriesBannerImageForm } from "./content-banner-image-form";
import { ContentPopularForm } from "./content-popular-form";

interface ContentFormProps {
  series: Series;
  seasons: Season[];
  episodes: Episode[];
  categories: Genre[];
  contentLanguage: ContentLanguage[];
  ageRatingOptions: { value: string; name: string }[];
}

export async function ContentForm({
  categories,
  series,
  contentLanguage,
  ageRatingOptions,
}: ContentFormProps) {
  const content = await db.series.findUnique({
    where: {
      id: series.id,
    },
    include: {
      seasons: true,
    },
  });

  if (!content?.id) {
    throw new Error("Series not found");
  }

  const requiredFields = [
    content.name,
    content.description,
    content.region,
    content.thumbnailImageUrl,
    content.releaseDate,
    content.bannerImageUrl,
    content.castDescription,
    content.genreId,
    content.contentLanguageId,
    content.seasons.some((season) => season.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `${completedFields} / ${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      <div className="flex flex-col items-end mb-4">
        {!content.isPublished && (
          <Banner
            variant="warning"
            label="This series is now unpublished. It will not be visible in the platform"
          />
        )}
        {content.isPublished && (
          <Banner
            variant="success"
            label="This series is now published. It will be visible in the platform"
          />
        )}
        <ContentAction content={content} isComplete={isComplete} />
      </div>
      <Card className="mb-4 py-4">
        <CardHeader>
          <CardTitle>
            {content?.id ? "Edit Series" : "Create New Series"}
          </CardTitle>
          <CardDescription>
            {content?.id
              ? "Update series information and metadata."
              : "Add new series to the platform."}
            <p className="mt-2 text-muted-foreground">
              Complete all fields {completionText}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Content Details</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 pt-4">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="space-y-4">
                  <SeriesTitleForm
                    initialData={content}
                    contentId={content.id}
                  />

                  <SeriesDescriptionForm initialData={content} />
                </div>
                <SeriesReleaseForm initialData={content} />
                <SelectSeasonForm initialData={content.seasons} />
                <ContentGenresForm
                  initialData={content}
                  seriesId={content.id}
                  options={categories.map((genre) => ({
                    name: genre.name,
                    value: genre.id,
                  }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-6 pt-4">
              <div className="grid gap-6 grid-cols-2">
                <div className="space-y-4">
                  <SeriesRegionForm initialData={content} />

                  <SeriesCastDescriptionForm initialData={content} />
                </div>
                <ContentLanguageForm
                  initialData={{
                    ...content,
                    contentLanguageId: content.contentLanguageId ?? null,
                  }}
                  seriesId={content.id}
                  options={contentLanguage.map((language) => ({
                    name: language.name,
                    value: language.id,
                  }))}
                />
                <ContentPopularForm initialData={content}/>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 pt-4">
              <div className="space-y-6">
                <div className="flex items-center gap-x-4">
                  <SeriesImageForm initialData={content} />
                  <SeriesBannerImageForm initialData={content} />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Trailer Video</h3>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Video File
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {content?.trailerVideoUrl?.length === 0 && (
                      <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">
                          No video files added yet.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-center rounded-md border border-dashed p-4">
                      <Button type="button" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Video File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-6 pt-4">
              <div className="grid gap-6 lg:grid-cols-2 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <ContentAgeRatingForm
                      initialData={content}
                      seriesId={content.id}
                      options={ageRatingOptions}
                    />
                    <Separator className="my-4" />
                    <div>Availability</div>
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="all-regions" />
                        <Label htmlFor="all-regions">
                          Available in all regions
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="geo-restriction" />
                        <Label htmlFor="geo-restriction">
                          Enable geo-restrictions
                        </Label>
                      </div>

                      {/* <div className="pt-2">
                          <Label htmlFor="regions">Available Regions</Label>
                          <Select defaultValue="all">
                            <SelectTrigger id="regions" className="mt-2">
                              <SelectValue placeholder="Select regions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Regions</SelectItem>
                              <SelectItem value="na">North America</SelectItem>
                              <SelectItem value="eu">Europe</SelectItem>
                              <SelectItem value="as">Asia</SelectItem>
                              <SelectItem value="sa">South America</SelectItem>
                              <SelectItem value="af">Africa</SelectItem>
                              <SelectItem value="oc">Oceania</SelectItem>
                            </SelectContent>
                          </Select>
                        </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
