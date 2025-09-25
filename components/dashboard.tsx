"use client"

import { useState } from "react"
import { BarChart3, Film, Library, ListVideo, Plus, Search, Settings, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddEpisodeDialog } from "./add-episode-dialog"
import { AddSeasonDialog } from "./add-season-dialog"
import { ContentList } from "./content-list"
import { SeasonSelector } from "./season-selector"
import { SidebarNav } from "./sidebar-nav"

export default function Dashboard() {
  const [selectedSeason, setSelectedSeason] = useState<string>("1")
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false)
  const [isAddEpisodeOpen, setIsAddEpisodeOpen] = useState(false)

  // Mock data for seasons
  const seasons = [
    { id: "1", name: "Season 1" },
    { id: "2", name: "Season 2" },
    { id: "3", name: "Season 3" },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search content..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Content
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-4 pt-6 md:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
            <Tabs defaultValue="series" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="series" className="text-zinc-600 dark:text-zinc-200">
                    <ListVideo className="mr-2 h-4 w-4" />
                    Series
                  </TabsTrigger>
                  <TabsTrigger value="movies" className="text-zinc-600 dark:text-zinc-200">
                    <Film className="mr-2 h-4 w-4" />
                    Movies
                  </TabsTrigger>
                  <TabsTrigger value="library" className="text-zinc-600 dark:text-zinc-200">
                    <Library className="mr-2 h-4 w-4" />
                    Library
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="series" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle>Season Management</CardTitle>
                      <CardDescription>Manage seasons and episodes for your series</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddSeasonOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Season
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <SeasonSelector
                        seasons={seasons}
                        selectedSeason={selectedSeason}
                        onSelectSeason={setSelectedSeason}
                      />
                      <Button onClick={() => setIsAddEpisodeOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Episode
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <ContentList seasonId={selectedSeason} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="movies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Movies</CardTitle>
                    <CardDescription>Manage your movie content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Movie management interface will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="library" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Library</CardTitle>
                    <CardDescription>Browse and manage your entire content library</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Content library interface will be displayed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <AddSeasonDialog open={isAddSeasonOpen} onOpenChange={setIsAddSeasonOpen} />
      <AddEpisodeDialog open={isAddEpisodeOpen} onOpenChange={setIsAddEpisodeOpen} seasonId={selectedSeason} />
    </div>
  )
}
