"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Film, Loader2, Plus, Upload, X, User, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Movie {
  id?: string
  title: string
  description: string
  duration: string
  releaseDate: Date | undefined
  genre: string[]
  cast: CastMember[]
  director: string
  producer: string
  rating: string
  status: "draft" | "scheduled" | "published"
  thumbnail?: string
  trailer?: string
  language: string
  country: string
  budget?: string
  revenue?: string
}

interface CastMember {
  id: string
  name: string
  role: string
  character: string
}

interface AddMovieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie?: Movie | null
  onSave?: (movie: Movie) => void
}

const movieGenres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
]

const movieRatings = ["G", "PG", "PG-13", "R", "NC-17", "Not Rated"]

const availableCast = [
  { id: "1", name: "John Smith", role: "Actor" },
  { id: "2", name: "Jane Doe", role: "Actress" },
  { id: "3", name: "Mike Johnson", role: "Actor" },
  { id: "4", name: "Sarah Wilson", role: "Actress" },
  { id: "5", name: "David Brown", role: "Actor" },
]

export function AddMovieDialog({ open, onOpenChange, movie, onSave }: AddMovieDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<Movie>({
    title: movie?.title || "",
    description: movie?.description || "",
    duration: movie?.duration || "",
    releaseDate: movie?.releaseDate || undefined,
    genre: movie?.genre || [],
    cast: movie?.cast || [],
    director: movie?.director || "",
    producer: movie?.producer || "",
    rating: movie?.rating || "",
    status: movie?.status || "draft",
    thumbnail: movie?.thumbnail || "",
    trailer: movie?.trailer || "",
    language: movie?.language || "English",
    country: movie?.country || "United States",
    budget: movie?.budget || "",
    revenue: movie?.revenue || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCastMember, setNewCastMember] = useState({ name: "", character: "" })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Movie title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required"
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = "Release date is required"
    }

    if (formData.genre.length === 0) {
      newErrors.genre = "At least one genre is required"
    }

    if (!formData.director.trim()) {
      newErrors.director = "Director is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      // Switch to the tab with errors
      if (errors.title || errors.description || errors.duration || errors.releaseDate) {
        setActiveTab("basic")
      } else if (errors.genre || errors.director) {
        setActiveTab("details")
      }
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const movieData = {
        ...formData,
        id: movie?.id || `movie_${Date.now()}`,
      }

      onSave?.(movieData)
      toast.success(movie ? "Movie updated successfully" : "Movie added successfully")
      onOpenChange(false)

      // Reset form if adding new movie
      if (!movie) {
        setFormData({
          title: "",
          description: "",
          duration: "",
          releaseDate: undefined,
          genre: [],
          cast: [],
          director: "",
          producer: "",
          rating: "",
          status: "draft",
          thumbnail: "",
          trailer: "",
          language: "English",
          country: "United States",
          budget: "",
          revenue: "",
        })
        setActiveTab("basic")
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save movie")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setErrors({})
    setActiveTab("basic")
  }

  const addGenre = (genre: string) => {
    if (!formData.genre.includes(genre)) {
      setFormData({ ...formData, genre: [...formData.genre, genre] })
    }
  }

  const removeGenre = (genre: string) => {
    setFormData({ ...formData, genre: formData.genre.filter((g) => g !== genre) })
  }

  const addCastMember = (castId: string) => {
    const cast = availableCast.find((c) => c.id === castId)
    if (cast && !formData.cast.find((c) => c.id === castId)) {
      const newMember: CastMember = {
        id: cast.id,
        name: cast.name,
        role: cast.role,
        character: newCastMember.character || "Character Name",
      }
      setFormData({ ...formData, cast: [...formData.cast, newMember] })
      setNewCastMember({ name: "", character: "" })
    }
  }

  const removeCastMember = (castId: string) => {
    setFormData({ ...formData, cast: formData.cast.filter((c) => c.id !== castId) })
  }

  const updateCastCharacter = (castId: string, character: string) => {
    setFormData({
      ...formData,
      cast: formData.cast.map((c) => (c.id === castId ? { ...c, character } : c)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            {movie ? "Edit Movie" : "Add New Movie"}
          </DialogTitle>
          <DialogDescription>
            {movie
              ? "Update the movie details and metadata."
              : "Add a new movie to your content library with all relevant details."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Movie Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter movie title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter movie description or synopsis"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Duration and Release Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2h 15m"
                    className={`pl-10 ${errors.duration ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
              </div>

              <div className="grid gap-2">
                <Label>Release Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.releaseDate && "text-muted-foreground",
                        errors.releaseDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.releaseDate ? format(formData.releaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.releaseDate}
                      onSelect={(date) => setFormData({ ...formData, releaseDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.releaseDate && <p className="text-sm text-red-500">{errors.releaseDate}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Genres */}
            <div className="grid gap-2">
              <Label>Genres *</Label>
              <Select onValueChange={addGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Add genres" />
                </SelectTrigger>
                <SelectContent>
                  {movieGenres.map((genre) => (
                    <SelectItem key={genre} value={genre} disabled={formData.genre.includes(genre)}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genre.map((genre) => (
                  <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                    {genre}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                  </Badge>
                ))}
              </div>
              {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
            </div>

            {/* Director and Producer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="director">Director *</Label>
                <Input
                  id="director"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  placeholder="Director name"
                  className={errors.director ? "border-red-500" : ""}
                />
                {errors.director && <p className="text-sm text-red-500">{errors.director}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="producer">Producer</Label>
                <Input
                  id="producer"
                  value={formData.producer}
                  onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                  placeholder="Producer name"
                />
              </div>
            </div>

            {/* Rating and Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Select value={formData.rating} onValueChange={(value) => setFormData({ ...formData, rating: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {movieRatings.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="Primary language"
                />
              </div>
            </div>

            {/* Country */}
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Country of origin"
              />
            </div>

            {/* Budget and Revenue */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., $50,000,000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="e.g., $150,000,000"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cast" className="space-y-4">
            {/* Add Cast Member */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <Label>Cast Members</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Select Actor/Actress</Label>
                  <Select onValueChange={(value) => setNewCastMember({ ...newCastMember, name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose cast member" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCast.map((cast) => (
                        <SelectItem
                          key={cast.id}
                          value={cast.id}
                          disabled={formData.cast.some((c) => c.id === cast.id)}
                        >
                          {cast.name} ({cast.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Character Name</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCastMember.character}
                      onChange={(e) => setNewCastMember({ ...newCastMember, character: e.target.value })}
                      placeholder="Character name"
                    />
                    <Button
                      type="button"
                      onClick={() => addCastMember(newCastMember.name)}
                      disabled={!newCastMember.name || !newCastMember.character}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cast List */}
              {formData.cast.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <Label>Current Cast</Label>
                  <div className="space-y-2">
                    {formData.cast.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">as {member.character}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={member.character}
                            onChange={(e) => updateCastCharacter(member.id, e.target.value)}
                            placeholder="Character name"
                            className="w-32"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeCastMember(member.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            {/* Thumbnail */}
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trailer */}
            <div className="grid gap-2">
              <Label htmlFor="trailer">Trailer URL</Label>
              <Input
                id="trailer"
                value={formData.trailer}
                onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Preview */}
            {(formData.thumbnail || formData.title) && (
              <div className="grid gap-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    {formData.thumbnail ? (
                      <img
                        src={formData.thumbnail || "/placeholder.svg"}
                        alt={formData.title}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <Film className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-medium">{formData.title || "Movie Title"}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.description || "Movie description will appear here..."}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {movie ? "Update Movie" : "Add Movie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
