"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { MoviesList } from "@/components/movies-list"
import { AddMovieDialog } from "@/components/add-movie-dialog"
import { Plus } from "lucide-react"

export default function MoviesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <>
      <DashboardHeader heading="Movies Management" text="Manage your movie content">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Movies Library</CardTitle>
          <CardDescription>Browse and manage your movie content</CardDescription>
        </CardHeader>
        <CardContent>
          <MoviesList />
        </CardContent>
      </Card>

      <AddMovieDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={(movie) => {
          console.log("Movie saved:", movie)
          // Here you would typically update your movies list
        }}
      />
    </>
  )
}
