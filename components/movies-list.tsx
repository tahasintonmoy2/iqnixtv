"use client"
import { useState } from "react"
import Image from "next/image"
import { Clock, Edit, MoreHorizontal, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { AddMovieDialog } from "@/components/add-movie-dialog"

export function MoviesList() {
  const [editingMovie, setEditingMovie] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Mock data for movies
  const movies = [
    {
      id: "1",
      title: "Journey to the Unknown",
      description: "A thrilling adventure into uncharted territory where explorers discover ancient secrets.",
      duration: "2h 15m",
      thumbnail: "/placeholder.svg?height=180&width=320",
      releaseDate: new Date("2023-05-15"),
      status: "published",
      genre: ["Action", "Adventure"],
      cast: [
        { id: "1", name: "John Smith", role: "Actor", character: "Captain Explorer" },
        { id: "2", name: "Jane Doe", role: "Actress", character: "Dr. Sarah Mitchell" },
      ],
      director: "Michael Bay",
      producer: "Jerry Bruckheimer",
      rating: "PG-13",
      language: "English",
      country: "United States",
    },
    {
      id: "2",
      title: "Star Travelers",
      description: "Explorers venture into deep space to find a new home for humanity in this epic sci-fi adventure.",
      duration: "2h 30m",
      thumbnail: "/placeholder.svg?height=180&width=320",
      releaseDate: new Date("2023-07-22"),
      status: "published",
      genre: ["Sci-Fi", "Adventure"],
      cast: [{ id: "3", name: "Mike Johnson", role: "Actor", character: "Commander Rex" }],
      director: "Christopher Nolan",
      producer: "Emma Thomas",
      rating: "PG-13",
      language: "English",
      country: "United States",
    },
    {
      id: "3",
      title: "Mystery of the Deep",
      description: "A team of scientists discovers an ancient secret beneath the ocean in this thrilling mystery.",
      duration: "1h 55m",
      thumbnail: "/placeholder.svg?height=180&width=320",
      releaseDate: new Date("2023-09-10"),
      status: "scheduled",
      genre: ["Mystery", "Thriller"],
      cast: [],
      director: "James Cameron",
      producer: "Kathleen Kennedy",
      rating: "PG-13",
      language: "English",
      country: "United States",
    },
    {
      id: "4",
      title: "Legends of Tomorrow",
      description: "Heroes from different timelines unite to save the future in this action-packed adventure.",
      duration: "2h 05m",
      thumbnail: "/placeholder.svg?height=180&width=320",
      releaseDate: new Date("2023-11-05"),
      status: "draft",
      genre: ["Action", "Sci-Fi"],
      cast: [],
      director: "Russo Brothers",
      producer: "Kevin Feige",
      rating: "PG-13",
      language: "English",
      country: "United States",
    },
  ]

  const handleEditMovie = (movie: any) => {
    setEditingMovie(movie)
    setShowEditDialog(true)
  }

  const handleSaveMovie = (movie: any) => {
    console.log("Movie saved:", movie)
    setEditingMovie(null)
    // Here you would typically update your movies list
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {movies.map((movie) => (
          <Card key={movie.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image src={movie.thumbnail || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                <Clock className="h-3 w-3" />
                {movie.duration}
              </div>
            </div>
            <CardHeader className="p-4 pb-0">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{movie.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEditMovie(movie)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-2 line-clamp-2">{movie.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <div>Release: {movie.releaseDate.toLocaleDateString()}</div>
                <Badge
                  variant={
                    movie.status === "published" ? "default" : movie.status === "scheduled" ? "outline" : "secondary"
                  }
                >
                  {movie.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {movie.genre.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {movie.genre.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{movie.genre.length - 2}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Published</span>
                  <Switch checked={movie.status === "published"} />
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEditMovie(movie)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AddMovieDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        movie={editingMovie}
        onSave={handleSaveMovie}
      />
    </>
  )
}
