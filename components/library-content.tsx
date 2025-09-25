"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Trash2, Eye, Filter, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { AdvancedFilterDropdown } from "@/components/advanced-filter-dropdown"
import { EditLibraryItemDialog } from "@/components/edit-library-item-dialog"

// Mock data for content library
const contentItems = [
  {
    id: "1",
    title: "The Adventure Begins",
    type: "Series",
    season: "Season 1",
    episode: "Episode 1",
    duration: "42 min",
    releaseDate: "2023-01-15",
    status: "published",
    description: "The journey begins with an introduction to our main characters.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Action", "Drama"],
    videoFiles: [
      { name: "adventure_begins_hd.mp4", size: "1.2 GB", quality: "HD" },
      { name: "adventure_begins_4k.mp4", size: "3.5 GB", quality: "4K" },
    ],
    subtitleFiles: [
      { language: "English", file: "english.vtt" },
      { language: "Spanish", file: "spanish.vtt" },
    ],
  },
  {
    id: "2",
    title: "Journey to the Unknown",
    type: "Movie",
    season: "",
    episode: "",
    duration: "2h 15m",
    releaseDate: "2023-05-15",
    status: "published",
    description: "A thrilling adventure into uncharted territory.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Adventure", "Sci-Fi"],
    videoFiles: [
      { name: "journey_unknown_hd.mp4", size: "2.4 GB", quality: "HD" },
      { name: "journey_unknown_4k.mp4", size: "6.8 GB", quality: "4K" },
    ],
    subtitleFiles: [
      { language: "English", file: "english.vtt" },
      { language: "French", file: "french.vtt" },
    ],
  },
  {
    id: "3",
    title: "The Revelation",
    type: "Series",
    season: "Season 2",
    episode: "Episode 5",
    duration: "45 min",
    releaseDate: "2023-03-10",
    status: "published",
    description: "Secrets are revealed that change everything.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Drama", "Mystery"],
    videoFiles: [{ name: "revelation_hd.mp4", size: "1.4 GB", quality: "HD" }],
    subtitleFiles: [{ language: "English", file: "english.vtt" }],
  },
  {
    id: "4",
    title: "Star Travelers",
    type: "Movie",
    season: "",
    episode: "",
    duration: "2h 30m",
    releaseDate: "2023-07-22",
    status: "published",
    description: "Explorers venture into deep space to find a new home for humanity.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Sci-Fi", "Action"],
    videoFiles: [{ name: "star_travelers_hd.mp4", size: "2.8 GB", quality: "HD" }],
    subtitleFiles: [
      { language: "English", file: "english.vtt" },
      { language: "Japanese", file: "japanese.vtt" },
    ],
  },
  {
    id: "5",
    title: "Final Countdown",
    type: "Series",
    season: "Season 3",
    episode: "Episode 10",
    duration: "50 min",
    releaseDate: "2023-04-05",
    status: "published",
    description: "The team faces their greatest challenge yet.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Action", "Thriller"],
    videoFiles: [{ name: "final_countdown_hd.mp4", size: "1.5 GB", quality: "HD" }],
    subtitleFiles: [{ language: "English", file: "english.vtt" }],
  },
  {
    id: "6",
    title: "Mystery of the Deep",
    type: "Movie",
    season: "",
    episode: "",
    duration: "1h 55m",
    releaseDate: "2023-09-10",
    status: "scheduled",
    description: "A team of scientists discovers an ancient secret beneath the ocean.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Mystery", "Horror"],
    videoFiles: [{ name: "mystery_deep_hd.mp4", size: "2.2 GB", quality: "HD" }],
    subtitleFiles: [{ language: "English", file: "english.vtt" }],
  },
  {
    id: "7",
    title: "New Horizons",
    type: "Series",
    season: "Season 4",
    episode: "Episode 1",
    duration: "45 min",
    releaseDate: "2023-06-20",
    status: "draft",
    description: "Season 4 begins with new challenges and opportunities.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Drama", "Adventure"],
    videoFiles: [{ name: "new_horizons_hd.mp4", size: "1.3 GB", quality: "HD" }],
    subtitleFiles: [{ language: "English", file: "english.vtt" }],
  },
  {
    id: "8",
    title: "Legends of Tomorrow",
    type: "Movie",
    season: "",
    episode: "",
    duration: "2h 05m",
    releaseDate: "2023-11-05",
    status: "draft",
    description: "Heroes from different timelines unite to save the future.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    categories: ["Action", "Sci-Fi"],
    videoFiles: [{ name: "legends_tomorrow_hd.mp4", size: "2.3 GB", quality: "HD" }],
    subtitleFiles: [{ language: "English", file: "english.vtt" }],
  },
]

export function LibraryContent() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [filteredItems, setFilteredItems] = useState(contentItems)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<any>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [itemToView, setItemToView] = useState<any>(null)

  // Filter content items based on search query and filters
  useEffect(() => {
    let result = [...contentItems]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          (item.season && item.season.toLowerCase().includes(query)) ||
          (item.episode && item.episode.toLowerCase().includes(query)),
      )
    }

    // Apply type filter
    if (activeFilters.type) {
      result = result.filter((item) => item.type === activeFilters.type)
    }

    // Apply status filter
    if (activeFilters.status) {
      result = result.filter((item) => item.status === activeFilters.status)
    }

    // Apply category filter
    if (activeFilters.category) {
      result = result.filter((item) => item.categories.includes(activeFilters.category))
    }

    // Apply date filter
    if (activeFilters.date) {
      // In a real app, you would filter by date
      console.log("Date filter applied:", activeFilters.date)
    }

    setFilteredItems(result)
    // Reset selected items when filters change
    setSelectedItems([])
  }, [searchQuery, activeFilters])

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filters: Record<string, any>) => {
    setActiveFilters(filters)
  }

  const handleDeleteItem = (item: any) => {
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    // In a real app, you would delete the item from your backend
    console.log("Deleting item:", itemToDelete)
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  const handleEditItem = (item: any) => {
    setItemToEdit(item)
    setShowEditDialog(true)
  }

  const handleViewItem = (item: any) => {
    setItemToView(item)
    setShowViewDialog(true)
  }

  const handleAddNewItem = () => {
    setItemToEdit(null) // No item to edit means we're adding a new one
    setShowEditDialog(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "scheduled":
        return "outline"
      case "draft":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Define filter options
  const filterOptions = [
    {
      id: "type",
      label: "Content Type",
      type: "select" as const,
      options: [
        { label: "Movie", value: "Movie" },
        { label: "Series", value: "Series" },
        { label: "Documentary", value: "Documentary" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { label: "Published", value: "published" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Draft", value: "draft" },
      ],
    },
    {
      id: "category",
      label: "Category",
      type: "select" as const,
      options: [
        { label: "Action", value: "Action" },
        { label: "Drama", value: "Drama" },
        { label: "Comedy", value: "Comedy" },
        { label: "Sci-Fi", value: "Sci-Fi" },
        { label: "Horror", value: "Horror" },
        { label: "Mystery", value: "Mystery" },
        { label: "Adventure", value: "Adventure" },
        { label: "Thriller", value: "Thriller" },
      ],
    },
  ]

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <SearchFilterBar placeholder="Search content..." onSearchChange={handleSearch} className="flex-1">
          <AdvancedFilterDropdown
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </SearchFilterBar>
      </div>

      {selectedItems.length > 0 && (
        <div className="bg-muted/50 mb-4 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Selected
            </Button>
            <Button className="bg-red-600 hover:bg-red-600/80" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Season/Episode</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No content items found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                      aria-label={`Select ${item.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    {item.season} {item.episode}
                  </TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell>{item.releaseDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewItem(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditItem(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteItem(item)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <EditLibraryItemDialog item={itemToEdit} seasons={[]} episodes={[]} categories={[]} />

      {/* View Content Dialog */}
      {itemToView && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Content Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border mb-4">
                  <img
                    src={itemToView.thumbnail || "/placeholder.svg?height=180&width=320"}
                    alt={itemToView.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{itemToView.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {itemToView.type} • {itemToView.duration}
                </p>
                <p className="text-sm mb-4">{itemToView.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {itemToView.categories.map((category: string) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Content Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Status:</div>
                    <div>
                      <Badge variant={getStatusBadgeVariant(itemToView.status)}>
                        {itemToView.status.charAt(0).toUpperCase() + itemToView.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">Release Date:</div>
                    <div>{itemToView.releaseDate}</div>
                    {itemToView.type === "Series" && (
                      <>
                        <div className="text-muted-foreground">Season:</div>
                        <div>{itemToView.season}</div>
                        <div className="text-muted-foreground">Episode:</div>
                        <div>{itemToView.episode}</div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Video Files</h4>
                  <div className="space-y-2">
                    {itemToView.videoFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <div>{file.name}</div>
                        <div className="text-muted-foreground">
                          {file.size} • {file.quality}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Subtitle Files</h4>
                  <div className="space-y-2">
                    {itemToView.subtitleFiles.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <div>{file.language}</div>
                        <div className="text-muted-foreground">{file.file}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewDialog(false)
                  handleEditItem(itemToView)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
