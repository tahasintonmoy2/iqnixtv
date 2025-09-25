"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Film, ListVideo, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Episode, Genre, Season, Series } from "@/lib/generated/prisma";
import { DatePicker } from "./ui/date-picker";
import Image from "next/image";
import { useCreateSeries } from "@/hooks/use-create-series";
import { FileUploadButton } from "./file-upload-button";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Content type is required"),
  description: z.string().optional(),
  releaseDate: z.date(),
  status: z.string().min(1, "Status is required"),
  seasonId: z.string(),
  thumbnailImageUrl: z.string(),
  episodeId: z.array(z.string()),
  categoryId: z.array(z.string()),
});

interface EditLibraryItemDialogProps {
  item: Series; // The library item to edit
  seasons: Season[];
  episodes: Episode[];
  categories: Genre[];
}

export function EditLibraryItemDialog({
  item,
  seasons,
  episodes,
  categories,
}: EditLibraryItemDialogProps) {
  const [activeTab, setActiveTab] = useState("metadata");
  const { isOpen, onClose } = useCreateSeries();
  const [videoFiles, setVideoFiles] = useState<string>(
    item?.trailerVideoUrl || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string>(
    item?.genreId || ""
  );

  // Available categories
  const availableCategories = [
    "Action",
    "Comedy",
    "Drama",
    "Sci-Fi",
    "Horror",
    "Documentary",
    "Thriller",
    "Romance",
    "Animation",
    "Family",
  ];

  // Initialize form with item data if available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      type: item?.type || "Movie",
      description: item?.description || "",
      releaseDate: item?.releaseDate ? new Date(item.releaseDate) : undefined,
      seasonId: item?.season || "",
      thumbnailImageUrl: item?.thumbnailImageUrl || "",
      episodeId: Array.isArray(item?.episode) ? item.episode : [],
      categoryId: Array.isArray(item?.genreId) ? item.genreId : [],
    },
  });

  const contentType = form.watch("type");
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // In a real app, you would save the form data to your backend
    console.log({
      ...values,
    });
    onClose();
  }

  const toggleCategory = (category: string) => {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Content" : "Add New Series"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details for this content item in your library."
              : "Add a new series item to your library."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="files">Files & Media</TabsTrigger>
            <TabsTrigger value="settings">Categories & Settings</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pt-6"
            >
              <TabsContent value="metadata" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Content title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Movie">
                                <div className="flex items-center">
                                  <Film className="mr-2 h-4 w-4" />
                                  <span>Movie</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Series">
                                <div className="flex items-center">
                                  <ListVideo className="mr-2 h-4 w-4" />
                                  <span>Series</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Documentary">
                                Documentary
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {contentType === "Series" && (
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          name="seasonId"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Season</FormLabel>
                              <Select
                                disabled={isSubmitting}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      defaultValue={field.value}
                                      placeholder="Select a season"
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {seasons.map((season) => (
                                    <SelectItem
                                      value={season.id}
                                      key={season.id}
                                    >
                                      {season.name} {season.seasonNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="episodeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Episode</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  values={field.value ?? []}
                                  onValuesChange={(vals) =>
                                    field.onChange(vals)
                                  }
                                >
                                  <MultiSelectTrigger
                                    className="w-auto"
                                    disabled={isSubmitting}
                                  >
                                    <MultiSelectValue
                                      placeholder="Select career..."
                                      disabled={isSubmitting}
                                    />
                                  </MultiSelectTrigger>
                                  <MultiSelectContent>
                                    <MultiSelectGroup>
                                      {episodes.map((episode) => (
                                        <MultiSelectItem
                                          value={episode.id}
                                          key={episode.id}
                                        >
                                          {episode.name} {episode.episodeNumber}
                                        </MultiSelectItem>
                                      ))}
                                    </MultiSelectGroup>
                                  </MultiSelectContent>
                                </MultiSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Content description"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Thumbnail</h3>
                    <div className="flex items-start gap-4">
                      <div className="relative aspect-video w-[180px] overflow-hidden rounded-md border">
                        <Image
                          src={
                            item?.thumbnailImageUrl ||
                            "/placeholder.svg?height=180&width=320"
                          }
                          alt="Thumbnail preview"
                          fill
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          name="thumbnailImageUrl"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <FileUploadButton
                                  onChange={(url) => field.onChange(url)}
                                  endPoint="videoImage"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended: 16:9 ratio, at least 1280x720px
                        </p>
                      </div>
                    </div>
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
                      {videoFiles.length === 0 && (
                        <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">
                            No video files added yet.
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-center rounded-md border border-dashed p-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("video-upload")?.click()
                          }
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video File
                        </Button>
                        <Input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div>
                  <div>
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <FormControl>
                            <MultiSelect
                              values={field.value ?? []}
                              onValuesChange={(vals) => field.onChange(vals)}
                            >
                              <MultiSelectTrigger
                                className="w-auto"
                                disabled={isSubmitting}
                              >
                                <MultiSelectValue
                                  placeholder="Select career..."
                                  disabled={isSubmitting}
                                />
                              </MultiSelectTrigger>
                              <MultiSelectContent>
                                <MultiSelectGroup>
                                  {categories.map((category) => (
                                    <MultiSelectItem
                                      value={category.id}
                                      key={category.id}
                                    >
                                      {category.name}
                                    </MultiSelectItem>
                                  ))}
                                </MultiSelectGroup>
                              </MultiSelectContent>
                            </MultiSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {/* {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => toggleCategory(category)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {category}</span>
                      </Button>
                    </Badge>
                  ))} */}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Featured Content
                      </label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="featured" />
                        <label
                          htmlFor="featured"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Mark as featured content
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Featured content will be highlighted on the platform
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Content Restrictions
                      </label>
                      <Select defaultValue="none">
                        <SelectTrigger>
                          <SelectValue placeholder="Select restriction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No restrictions</SelectItem>
                          <SelectItem value="premium">
                            Premium subscribers only
                          </SelectItem>
                          <SelectItem value="geo">Geo-restricted</SelectItem>
                          <SelectItem value="age">Age-restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">SEO Keywords</label>
                    <Textarea
                      placeholder="Enter keywords separated by commas"
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      These keywords will help users find this content when
                      searching
                    </p>
                  </div>
                </div>
              </TabsContent>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
