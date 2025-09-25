"use client"

import type React from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, UploadIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEpisode } from "@/hooks/use-episode"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"

interface AddEpisodeDialogProps {
  seasonId: string | null
}

const formSchema = z.object({
  title: z.string().min(1, "Episode title is required"),
  episodeNumber: z.string().min(1, "Episode number is required"),
  description: z.string().optional(),
  releaseDate: z.date().optional(),
  duration: z.string().min(1, "Duration is required"),
  status: z.string().min(1, "Status is required"),
})

export function AddEpisodeDialog({ seasonId }: AddEpisodeDialogProps) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const { isOpen, onClose } = useEpisode();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      episodeNumber: "",
      description: "",
      duration: "",
      status: "draft",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission
    console.log(values)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Episode</DialogTitle>
          <DialogDescription>Create a new episode. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[480px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Episode Title" {...field} />
                      </FormControl>
                      <FormDescription>Enter the title for this episode.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="episodeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Number</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormDescription>Enter the episode number.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Episode description" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Provide a brief description of this episode.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Select a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Select the release date for this episode.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="45" {...field} />
                      </FormControl>
                      <FormDescription>Enter the episode duration in minutes.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Set the publication status of this episode.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label
                  htmlFor="thumbnail"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thumbnail
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("thumbnail")?.click()}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Thumbnail
                  </Button>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                  {thumbnailPreview && (
                    <div className="relative h-20 w-36 overflow-hidden rounded-md border">
                      <Image
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        fill
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a thumbnail image for this episode. Recommended size: 16:9 ratio.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="videoFile"
                >
                  Video File
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("videoFile")?.click()}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
                <Input id="videoFile" type="file" accept="video/*" className="hidden" />
                <p className="text-sm text-muted-foreground">
                  Upload the video file for this episode. Supported formats: MP4, MOV, MKV.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Create Episode</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
