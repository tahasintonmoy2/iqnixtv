"use client";

import { SelectSeriesForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/trailers/components/select-series-form";
import { SelectTrailerTypeForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/trailers/components/select-trailer-type-form";
import { TrailerImageForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/trailers/components/trailer-image-form";
import { TrailerTitleForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/trailers/components/trailer-title-form";
import { TrailerVideoForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/trailers/components/trailer-video-form";
import { Badge } from "@/components/ui/badge";
import Banner from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trailers, TrailersStatus } from "@/lib/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Globe, Lock, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const episodeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  thumbnailImageUrl: z.string().optional(),
  videoUrl: z.string(),
  seriesId: z.string(),
  type: z.enum(["TRAILER", "TEASER", "CLIP"]),
  isPublished: z.boolean(),
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

interface EpisodeFormProps {
  trailer: Trailers;
  trailerId: string;
  seriesOptions: { value: string; name: string }[];
}

export function TrailerForm({
  seriesOptions,
  trailer,
  trailerId,
}: EpisodeFormProps) {
  const router = useRouter();

  const trailerTypeOptions = Object.values(TrailersStatus).map((type) => ({
    name: type.charAt(0) + type.slice(1).toLowerCase(),
    value: type,
  }));
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: EpisodeFormValues = {
    name: trailer?.name || "",
    type: trailer.type || "TRAILER",
    thumbnailImageUrl: trailer.thumbnailImageUrl || "",
    videoUrl: trailer.videoUrl || "",
    seriesId: trailer.seriesId || "",
    isPublished: trailer?.isPublished || false,
  };

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues,
  });

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      if (trailer.isPublished) {
        await axios.patch(`/api/series/trailer/${trailerId}/unpublish`);
        toast.success("Teailer has been unpublished");
        router.refresh();
      } else {
        await axios.patch(`/api/series/trailer/${trailerId}/publish`);
        toast.success("Teailer has been published");
        router.refresh();
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed to Published Trailer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const requiredFields = [
    trailer.name,
    trailer.seriesId,
    trailer.type,
    trailer.videoUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `${completedFields} / ${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      <div className="flex flex-col items-end mb-4">
        {!trailer.isPublished && (
          <Banner
            variant="warning"
            label="This trailer is now unpublished. It will not be visible in the series"
          />
        )}
        {trailer.isPublished && (
          <Banner
            variant="success"
            label="This trailer is now published. It will be visible in the series"
          />
        )}
        <Button onClick={onSubmit} disabled={!isComplete}>
          {trailer.isPublished ? (
            <>
              {isLoading ? (
                <div className="loader"></div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Lock className="size-4" />
                  Unpublic
                </div>
              )}
            </>
          ) : (
            <>
              {isLoading ? (
                <div className="loader"></div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Globe className="size-4" />
                  Public
                </div>
              )}
            </>
          )}
        </Button>
      </div>
      <Card className="mb-4">
        <CardHeader className="pt-4">
          <CardTitle>
            {trailer?.id ? "Edit Trailer" : "Create New Trailer"}
          </CardTitle>
          <CardDescription>
            {trailer?.id
              ? "Update trailer information and media files."
              : "Add a new trailer to your series."}
          </CardDescription>
          <p className="mt-2 text-muted-foreground">
            Complete all fields {completionText}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media Files</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <SelectSeriesForm
                      initialData={trailer}
                      trailerId={trailerId}
                      options={seriesOptions}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <TrailerTitleForm
                        initialData={{ title: trailer?.name }}
                        trailerId={trailerId}
                      />
                    </div>

                    <div className="space-y-2">
                      <SelectTrailerTypeForm
                        initialData={trailer}
                        trailerId={trailerId}
                        options={trailerTypeOptions}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <TrailerVideoForm
                      initialData={trailer}
                      trailerId={trailerId}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <TrailerImageForm
                        initialData={trailer}
                        trailerId={trailerId}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Subtitles</Label>
                      <div className="rounded-lg border">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">English</span>
                            <Badge variant="outline">SRT</Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="border-t p-4">
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subtitle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
