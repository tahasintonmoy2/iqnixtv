"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMobile } from "@/hooks/use-mobile";
import { Playlist } from "@/lib/generated/prisma";
import {
  Bookmark,
  Clock,
  Edit,
  Grid,
  List,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PlaylistsProps {
  playlistsData: Playlist[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function PlaylistsSection({
  viewMode,
  onViewModeChange,
  playlistsData,
}: PlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>(playlistsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const isMobile = useMobile();
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });

  // Filter playlists based on search query
  const filteredPlaylists = playlists?.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.description?.toLowerCase() ?? "").includes(
        searchQuery.toLowerCase()
      )
  );

  const handleEditPlaylist = () => {
    if (!selectedPlaylist) return;

    const updatedPlaylists = playlists?.map((playlist) =>
      playlist.id === selectedPlaylist.id
        ? {
            ...playlist,
            title: newPlaylist.name,
            description: newPlaylist.description,
            lastUpdatedAt: new Date(),
          }
        : playlist
    );

    setPlaylists(updatedPlaylists);
    setIsEditDialogOpen(false);
    setSelectedPlaylist(null);
    setNewPlaylist({ name: "", description: "" });
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this playlist? This action cannot be undone."
      )
    ) {
      setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
    }
  };

  const openEditDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylist({
      name: playlist.name,
      description: playlist.description || "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="py-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            My Playlists
            {playlistsData?.length && (
              <Badge variant="secondary">{playlistsData?.length}</Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>

            {/* Create Playlist */}
            <Button size="sm">
              <Plus className="size-4" />
              {!isMobile && "Create"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {playlistsData?.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No playlists found" : "No playlists yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first playlist to organize your favorite content"}
            </p>
            {!searchQuery && (
              <Button variant="secondary">
                <Plus className="size-4 mr-2" />
                Create
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {playlistsData?.map((playlist) => (
              <div key={playlist.id}>
                {viewMode === "grid" ? (
                  // Grid View
                  <Card className="group hover:shadow-lg transition-all duration-200">
                    <div className="relative">
                      <Image
                        src={playlist.thumbnailImageUrl || "/placeholder.svg"}
                        alt={playlist.name}
                        height={160}
                        width={160}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-t-lg">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="mr-2"
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                        <p className="mt-2">View playlist</p>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">
                          {playlist.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditDialog(playlist)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePlaylist(playlist.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {playlist.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{playlist.itemCount} items</span>
                        <span className="flex items-center">
                          <Clock className="size-4 mr-2" />
                          {playlist.duration}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          Updated{" "}
                          {new Date(
                            playlist.lastUpdatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // List View
                  <Card className="group hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Image
                          src={playlist.thumbnailImageUrl || "/placeholder.svg"}
                          alt={playlist.name}
                          fill
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {playlist.name}
                            </h3>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {playlist.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {playlist.itemCount} items
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {playlist.duration}
                            </span>
                            <span>
                              Updated{" "}
                              {new Date(
                                playlist.lastUpdatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(playlist)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeletePlaylist(playlist.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Playlist Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>
                Update your playlist information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-playlist-title">Title</Label>
                <Input
                  id="edit-playlist-title"
                  placeholder="Enter playlist title"
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist({ ...newPlaylist, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-playlist-description">Description</Label>
                <Textarea
                  id="edit-playlist-description"
                  placeholder="Enter playlist description"
                  value={newPlaylist.description}
                  onChange={(e) =>
                    setNewPlaylist({
                      ...newPlaylist,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPlaylist}
                disabled={!newPlaylist.name.trim()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
