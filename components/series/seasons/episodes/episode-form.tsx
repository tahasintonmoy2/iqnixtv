"use client";

import { AgeRatingForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/age-rating-form";
import { EpisodeAccessForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-access-form";
import { EpisodeDescriptionForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-description-form";
import { EpisodeNumberForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-number-form";
import { EpisodeReleaseForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-release-form";
import { EpisodeTitleForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-title-form";
import { EpisodeVideoForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/episode-video-form";
import { SelectSeasonForm } from "@/app/(routes)/(admin)/studio/(dashboard)/(routes)/series/[seriesId]/seasons/[seasonId]/episodes/[episodeId]/_components/select-season-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Episode } from "@/lib/generated/prisma";
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
  episodeNumber: z.number().min(1, "Episode number must be at least 1."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  releaseDate: z.date(),
  seasonId: z.string(),
  ageRating: z.string(),
  contentWarnings: z.array(z.string()).optional(),
  isFree: z.boolean(),
});

type EpisodeFormValues = z.infer<typeof episodeFormSchema>;

interface EpisodeFormProps {
  episode: Episode;
  seasonId: string;
  seriesId: string;
  seasonOptions: { value: string; name: string; seasonNumber: string }[];
  ageRatingOptions: { value: string; name: string }[];
}

export function EpisodeForm({
  episode,
  seasonOptions,
  ageRatingOptions,
  seriesId,
  seasonId,
}: EpisodeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: EpisodeFormValues = {
    name: episode?.name || "",
    episodeNumber: episode?.episodeNumber || 0,
    description: episode?.description || "",
    releaseDate: episode?.releaseDate || new Date(),
    seasonId: episode?.seasonId || "",
    ageRating: episode?.ageRatingId || "13+",
    contentWarnings: Array.isArray(episode?.contentWarnings)
      ? episode.contentWarnings
      : [],
    isFree: episode?.isFree !== undefined ? episode.isFree : false,
  };

  const form = useForm<EpisodeFormValues>({
    resolver: zodResolver(episodeFormSchema),
    defaultValues,
  });

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      if (episode.isPublished) {
        await axios.patch(
          `/api/series/${seriesId}/season/${seasonId}/episode/${episode.id}/unpublish`
        );
        toast.success("Episode has been unpublished");
        router.refresh();
      } else {
        await axios.patch(
          `/api/series/${seriesId}/season/${seasonId}/episode/${episode.id}/publish`
        );
        toast.success("Episode has been published");
        router.refresh();
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong.", {
        description: "Failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requiredFields = [
    episode.name,
    episode.ageRatingId,
    episode.description,
    episode.episodeNumber,
    episode.releaseDate,
    episode.seasonId,
    episode.videoUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `${completedFields} / ${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  const contentWarnings = [
    "Violence",
    "Strong Language",
    "Sexual Content",
    "Drug Use",
    "Frightening Scenes",
    "Discrimination",
  ];

  return (
    <>
    <div className="flex flex-col items-end mb-4">
      {!episode.isPublished && (
        <Banner
          variant="warning"
          label="This episode is now unpublished. It will not be visible in the season"
        />
      )}
      {episode.isPublished && (
        <Banner
          variant="success"
          label="This episode is now published. It will be visible in the season"
        />
      )}
      <Button onClick={onSubmit} disabled={!isComplete} >
        {episode.isPublished ? (
          <>
          {isLoading ? (
            <div className="loader"></div>
          ): (
            <div className="flex items-center gap-x-2">
              <Lock className="size-4"/>
              Unpublic
            </div>
          )}
          </>
        ): (
          <>
          {isLoading ? (
            <div className="loader"></div>
          ): (
            <div className="flex items-center gap-x-2">
              <Globe className="size-4"/>
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
            {episode?.id ? "Edit Episode" : "Create New Episode"}
          </CardTitle>
          <CardDescription>
            {episode?.id
              ? "Update episode information and media files."
              : "Add a new episode to your season."}
          </CardDescription>
          <p className="mt-2 text-muted-foreground">
            Complete all fields {completionText}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Episode Details</TabsTrigger>
                <TabsTrigger value="media">Media Files</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <SelectSeasonForm
                      initialData={episode}
                      episodeId={episode?.id}
                      seasonId={seasonId}
                      seriesId={seriesId}
                      options={seasonOptions}
                    />

                    <EpisodeTitleForm
                      initialData={{ title: episode?.name }}
                      episodeId={episode?.id}
                      seasonId={seasonId}
                      seriesId={seriesId}
                    />
                    <EpisodeNumberForm
                      initialData={episode}
                      episodeId={episode?.id}
                      seasonId={seasonId}
                      seriesId={seriesId}
                    />
                  </div>

                  <div className="space-y-4">
                    <EpisodeDescriptionForm
                      initialData={episode}
                      episodeId={episode.id}
                      seasonId={episode.seasonId}
                      seriesId={seriesId}
                    />

                    <EpisodeReleaseForm
                      initialData={episode}
                      seasonId={episode.seasonId}
                      episodeId={episode.id}
                      seriesId={seriesId}
                    />

                    <AgeRatingForm
                      initialData={episode}
                      seasonId={episode.seasonId}
                      seriesId={seriesId}
                      episodeId={episode.id}
                      options={ageRatingOptions}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <EpisodeVideoForm
                      initialData={episode}
                      seasonId={episode.seasonId}
                      seriesId={seriesId}
                      episodeId={episode.id}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Audio Tracks
                      </Label>
                      <div className="rounded-lg border">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              English (Original)
                            </span>
                            <Badge variant="outline">Default</Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="border-t p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {}}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Audio Track
                          </Button>
                        </div>
                      </div>
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

              <TabsContent value="settings" className="space-y-6 pt-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <EpisodeAccessForm
                      initialData={episode}
                      seasonId={episode.seasonId}
                      seriesId={seriesId}
                      episodeId={episode.id}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contentWarnings"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">
                              Content Warnings
                            </FormLabel>
                            <FormDescription>
                              Select all applicable content warnings.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {contentWarnings.map((warning) => (
                              <FormField
                                key={warning}
                                control={form.control}
                                name="contentWarnings"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={warning}
                                      className="flex flex-row items-start space-x-2"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            warning
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...(field.value || []),
                                                  warning,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== warning
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {warning}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
