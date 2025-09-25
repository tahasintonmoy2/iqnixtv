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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSeason } from "@/hooks/use-create-season";
import { Series } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FileUploadButton } from "./file-upload-button";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "Season name is required"),
  description: z.string().optional(),
  releaseDate: z.date(),
  seasonNumber: z.string().min(1, "Season number is required"),
  seriesId: z.string().min(1, "Series ID is required"),
  isPublished: z.boolean(),
  trailerVideoUrl: z.string().optional(),
  thumbnailImageUrl: z.string().optional(),
});

interface AddSeasonDialogProps {
  series: Series[];
  seriesId: string
}

export function AddSeasonDialog({ series, seriesId }: AddSeasonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onClose } = useCreateSeason();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      seasonNumber: "",
      isPublished: false,
      seriesId, // Set the default seriesId
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/series/${series[0].id}/season`, values);
      onClose();
      toast.success("Season has been created!");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create season");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new season</DialogTitle>
          <DialogDescription>
            Create a new season for your series. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
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
                      <FormDescription>
                        Enter the season number.
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
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || seriesId}
                        defaultValue={seriesId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {series.find(s => s.id === (field.value || seriesId))?.name || "Select a series"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {series.map((ser) => (
                            <SelectItem key={ser.id} value={ser.id}>
                              {ser.name}
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
                              disabled={isSubmitting || isLoading}
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
                              onChange={(url) => field.onChange(url)}
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
                            onChange={(url) => field.onChange(url)}
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
                          Toggle to publish this season. Unpublished seasons
                          will not be visible to users.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting || isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? (
                  <div className="flex items-center">
                    <div className="loader"></div>
                    <p>Creating</p>
                  </div>
                ) : (
                  <p>Create Season</p>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
