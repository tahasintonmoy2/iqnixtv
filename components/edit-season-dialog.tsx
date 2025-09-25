"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Season } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { FileUploadButton } from "./file-upload-button";
interface SeasonFormProps {
  initialData: Season;
  seriesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Season name is required"),
  description: z.string().optional(),
  releaseDate: z.date().optional(),
  seasonNumber: z.string().min(1, "Season number is required"),
  isPublished: z.boolean(),
  trailerVideoUrl: z.string().optional(),
  thumbnailImageUrl: z.string().optional(),
});

export const EditSeasonDialog = ({
  initialData,
  seriesId,
  open,
  onOpenChange,
}: SeasonFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const title = initialData ? (
    <p>
      Edit <span className="text-violet-500">{`${initialData.name}`}</span>
    </p>
  ) : (
    "Add New Season"
  );
  const description = initialData
    ? `Edit ${initialData.name} details`
    : "Create a new season for your series. Fill in the details below.";
  const taostMessage = initialData
    ? "Season has been updated"
    : "Season has been created!";
  const action = initialData ? "Save change" : "Create Season";
  const actionLoad = initialData && isLoading ? "Updating" : "Creating";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      releaseDate: initialData.releaseDate,
      seasonNumber: initialData.seasonNumber,
      isPublished: initialData.isPublished || false,
      trailerVideoUrl: initialData.trailerVideoUrl || "",
      thumbnailImageUrl: initialData.thumbnailImageUrl || "",
    },
    values: {
      // Use `values` to ensure form updates when `season` prop changes
      name: initialData.name || "",
      description: initialData.description || "",
      releaseDate: initialData.releaseDate,
      seasonNumber: initialData.seasonNumber,
      isPublished: initialData.isPublished || false,
      trailerVideoUrl: initialData.trailerVideoUrl || "",
      thumbnailImageUrl: initialData.thumbnailImageUrl || "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/series/${seriesId}/season/${initialData.id}`, values);
      }
      onOpenChange(false);
      toast.success(taostMessage);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update season");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[470px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Season Title"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the title for this season.
                    </FormDescription>
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
                        placeholder="Season description"
                        className="min-h-[100px]"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of this season.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Release Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Select a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          disabled={isSubmitting || isLoading}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the release date for this season.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seasonNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter the season number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <FormField
                    control={form.control}
                    name="thumbnailImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail image</FormLabel>
                        <FormControl>
                        <FileUploadButton
                            endPoint="videoImage"
                            onChange={(url)=> field.onChange(url)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="trailerVideoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video</FormLabel>
                      <FormControl>
                      <FileUploadButton
                            endPoint="episodeVideo"
                            onChange={(url)=> field.onChange(url)}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Season</FormLabel>
                      <FormDescription>
                        Toggle to publish this season. Unpublished seasons will
                        not be visible to users.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center">
                      <div className="loader"></div>
                      <p>{actionLoad}</p>
                    </div>
                  ) : (
                    <p>{action}</p>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
