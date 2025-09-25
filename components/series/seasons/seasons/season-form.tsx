"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect, MultiSelectContent, MultiSelectItem, MultiSelectTrigger, MultiSelectValue } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Cast, Genre, Season } from "@/lib/generated/prisma"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const seasonFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  seasonNumber: z.string().min(1, "Season number must be at least 1."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  releaseDate: z.date(),
  isPublished: z.boolean(),
  trailerUrl: z.string().optional(),
  casts: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
})

type SeasonFormValues = z.infer<typeof seasonFormSchema>

interface SeasonFormProps {
  season: Season & {
    casts?: Cast[];
    genres?: Genre[];
  },
  seriesOptions: { id: string; title: string }[]
}

export function SeasonForm({ season, seriesOptions }: SeasonFormProps) {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [availableCasts, setAvailableCasts] = useState<Cast[]>([])
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([])
  const [selectedCasts, setSelectedCasts] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Fetch available casts and genres
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all available casts
        const castsResponse = await axios.get('/api/series/season/cast')
        setAvailableCasts(castsResponse.data)

        // Fetch all available genres
        const genresResponse = await axios.get('/api/categories')
        setAvailableGenres(genresResponse.data)

        // If editing, set selected casts and genres
        if (season?.id) {
          if (season.casts && Array.isArray(season.casts)) {
            setSelectedCasts(season.casts.map((cast: Cast) => cast.id))
          }
          if (season.genres && Array.isArray(season.genres)) {
            setSelectedGenres(season.genres.map((genre: Genre) => genre.id))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error("Failed to load cast and genre data")
      }
    }

    fetchData()
  }, [season])

  const defaultValues: Partial<SeasonFormValues> = {
    name: season?.name || "",
    seasonNumber: season?.seasonNumber || "1",
    description: season?.description || "",
    releaseDate: season?.releaseDate || new Date(),
    isPublished: season?.isPublished || false,
    trailerUrl: season?.seriesId || "",
    casts: selectedCasts,
    genres: selectedGenres,
  }

  const form = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues,
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: SeasonFormValues) {
    setIsLoading(true)

    try {
      const payload = {
        ...data,
        casts: selectedCasts,
        genres: selectedGenres,
      }

      if (season) {
        await axios.patch(`/api/series/season/${params.seasonId}`, payload)
        toast.success("Season updated",{
          description: `${data.name} has been updated successfully.`,
        })
      } else {
        await axios.post("/api/series/season", payload)
        toast.success("Season created",{
          description: `${data.name} has been created successfully.`,
        })
      }

        router.push("/dashboard/content")
        router.refresh()
    } catch (error) {
        console.log(error);
      toast.error("Something went wrong.",{
        description: "Your season was not saved. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{season?.id ? "Edit Season" : "Create New Season"}</CardTitle>
        <CardDescription>
          {season?.id ? "Update season information and metadata." : "Add a new season to your series."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="trailerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select episode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seriesOptions.map((series) => (
                            <SelectItem key={series.id} value={series.id}>
                              {series.title}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter season title" {...field} />
                      </FormControl>
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cast Selection */}
                <FormItem>
                  <FormLabel>Cast Members</FormLabel>
                  <MultiSelect
                    values={selectedCasts}
                    onValuesChange={setSelectedCasts}
                  >
                    <MultiSelectTrigger disabled={isLoading}>
                      <MultiSelectValue placeholder="Select cast members" disabled={isLoading} />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      {availableCasts.map((cast) => (
                        <MultiSelectItem key={cast.id} value={cast.id}>
                          {cast.name}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectContent>
                  </MultiSelect>
                  <FormDescription>
                    Select the cast members for this season
                  </FormDescription>
                </FormItem>

                {/* Genre Selection */}
                <FormItem>
                  <FormLabel>Genres</FormLabel>
                  <MultiSelect
                    values={selectedGenres}
                    onValuesChange={setSelectedGenres}
                  >
                    <MultiSelectTrigger disabled={isLoading}>
                      <MultiSelectValue placeholder="Select genres" disabled={isLoading} />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      {availableGenres.map((genre) => (
                        <MultiSelectItem key={genre.id} value={genre.id}>
                          {genre.name}
                        </MultiSelectItem>
                      ))}
                    </MultiSelectContent>
                  </MultiSelect>
                  <FormDescription>
                    Select the genres for this season
                  </FormDescription>
                </FormItem>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter season description" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="releaseDate"
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>URL to the season trailer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {season?.id ? "Update Season" : "Create Season"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
