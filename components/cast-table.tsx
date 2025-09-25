"use client"

import { useState, useEffect } from "react"
import { Edit, Eye, Star, Trash } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CastMemberProfile } from "@/components/cast-member-profile"

// Mock data for cast members - same as in cast-grid.tsx
const castMembers = [
  {
    id: "cast-1",
    name: "Emma Thompson",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Actor",
    featured: true,
    bio: "Award-winning actress known for her versatile performances in drama and comedy.",
    productions: [
      { id: "prod-1", title: "The Adventure Begins", type: "Series", character: "Dr. Sarah Mitchell" },
      { id: "prod-2", title: "Journey to the Unknown", type: "Movie", character: "Captain Elizabeth Wells" },
    ],
    awards: ["Academy Award", "BAFTA", "Golden Globe"],
    socialMedia: {
      instagram: "@emmathompson",
      twitter: "@emmathompson",
    },
  },
  {
    id: "cast-2",
    name: "Michael Chen",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Actor",
    featured: true,
    bio: "Rising star known for action roles and dramatic performances.",
    productions: [
      { id: "prod-3", title: "Star Travelers", type: "Movie", character: "Commander Lee" },
      { id: "prod-4", title: "The Revelation", type: "Series", character: "Detective James Wong" },
    ],
    awards: ["Asian Film Award", "Critics' Choice Award"],
    socialMedia: {
      instagram: "@michaelchen",
      twitter: "@michaelchenofficial",
    },
  },
  {
    id: "cast-3",
    name: "Sophia Rodriguez",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Actor",
    featured: false,
    bio: "Versatile actress with a background in theater and independent films.",
    productions: [
      { id: "prod-5", title: "Mystery of the Deep", type: "Movie", character: "Dr. Maria Gonzalez" },
      { id: "prod-6", title: "New Horizons", type: "Series", character: "Lieutenant Ana Diaz" },
    ],
    awards: ["Independent Spirit Award"],
    socialMedia: {
      instagram: "@sophiarodriguez",
      twitter: "@sophiarodriguez",
    },
  },
  {
    id: "cast-4",
    name: "David Johnson",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Director",
    featured: false,
    bio: "Acclaimed director known for visually stunning and emotionally resonant films.",
    productions: [
      { id: "prod-2", title: "Journey to the Unknown", type: "Movie", character: "Director" },
      { id: "prod-7", title: "Legends of Tomorrow", type: "Movie", character: "Director" },
    ],
    awards: ["Directors Guild Award", "Cannes Film Festival Award"],
    socialMedia: {
      instagram: "@davidjohnson",
      twitter: "@davidjohnsondirector",
    },
  },
  {
    id: "cast-5",
    name: "Olivia Williams",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Actor",
    featured: true,
    bio: "Classically trained actress with a wide range of dramatic and period roles.",
    productions: [
      { id: "prod-8", title: "The Confrontation", type: "Series", character: "Margaret Thatcher" },
      { id: "prod-9", title: "Final Countdown", type: "Series", character: "General Patricia Stone" },
    ],
    awards: ["Emmy Award", "Screen Actors Guild Award"],
    socialMedia: {
      instagram: "@oliviawilliams",
      twitter: "@oliviawilliamsofficial",
    },
  },
  {
    id: "cast-6",
    name: "James Wilson",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Writer",
    featured: false,
    bio: "Award-winning screenwriter known for complex characters and intricate plots.",
    productions: [
      { id: "prod-3", title: "Star Travelers", type: "Movie", character: "Screenwriter" },
      { id: "prod-10", title: "Deep Space Explorers", type: "Documentary", character: "Writer" },
    ],
    awards: ["Writers Guild Award"],
    socialMedia: {
      instagram: "@jameswilson",
      twitter: "@jameswilsonwriter",
    },
  },
  {
    id: "cast-7",
    name: "Aisha Patel",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Actor",
    featured: false,
    bio: "International actress known for her work across multiple film industries.",
    productions: [
      { id: "prod-11", title: "Global Connections", type: "Series", character: "Leila Khan" },
      { id: "prod-5", title: "Mystery of the Deep", type: "Movie", character: "Dr. Priya Sharma" },
    ],
    awards: ["International Academy Award", "Asian Film Award"],
    socialMedia: {
      instagram: "@aishapatel",
      twitter: "@aishapatelofficial",
    },
  },
  {
    id: "cast-8",
    name: "Robert Martinez",
    photo: "/placeholder.svg?height=300&width=300",
    role: "Producer",
    featured: false,
    bio: "Veteran producer with over 20 years of experience in television and film.",
    productions: [
      { id: "prod-1", title: "The Adventure Begins", type: "Series", character: "Executive Producer" },
      { id: "prod-2", title: "Journey to the Unknown", type: "Movie", character: "Producer" },
    ],
    awards: ["Producers Guild Award"],
    socialMedia: {
      instagram: "@robertmartinez",
      twitter: "@robertmartinezproducer",
    },
  },
]

interface CastTableProps {
  searchQuery?: string
  filters?: Record<string, any>
}

export function CastTable({ searchQuery = "", filters = {} }: CastTableProps) {
  const [selectedCastMembers, setSelectedCastMembers] = useState<string[]>([])
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCastMember, setSelectedCastMember] = useState<any>(null)
  const [filteredCastMembers, setFilteredCastMembers] = useState(castMembers)

  // Filter cast members based on search query and filters
  useEffect(() => {
    let result = [...castMembers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.bio.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query) ||
          member.productions.some(
            (p: any) => p.title.toLowerCase().includes(query) || p.character.toLowerCase().includes(query),
          ),
      )
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter((member) => member.role.toLowerCase() === filters.role.toLowerCase())
    }

    // Apply featured filter
    if (filters.featured === "featured") {
      result = result.filter((member) => member.featured)
    } else if (filters.featured === "regular") {
      result = result.filter((member) => !member.featured)
    }

    // Apply production type filter
    if (filters.productionType && filters.productionType.length > 0) {
      result = result.filter((member) =>
        member.productions.some((p: any) => filters.productionType.includes(p.type.toLowerCase())),
      )
    }

    // Apply date filter
    if (filters.date) {
      // In a real app, you would filter by date
      // This is just a placeholder implementation
      console.log("Date filter applied:", filters.date)
    }

    setFilteredCastMembers(result)

    // Reset selected cast members when filters change
    setSelectedCastMembers([])
  }, [searchQuery, filters])

  const toggleSelectAll = () => {
    if (selectedCastMembers.length === filteredCastMembers.length) {
      setSelectedCastMembers([])
    } else {
      setSelectedCastMembers(filteredCastMembers.map((member) => member.id))
    }
  }

  const toggleSelectCastMember = (id: string) => {
    if (selectedCastMembers.includes(id)) {
      setSelectedCastMembers(selectedCastMembers.filter((memberId) => memberId !== id))
    } else {
      setSelectedCastMembers([...selectedCastMembers, id])
    }
  }

  const handleViewProfile = (castMember: any) => {
    setSelectedCastMember(castMember)
    setShowProfileDialog(true)
  }

  const handleEditCastMember = (castMember: any) => {
    setSelectedCastMember(castMember)
    setShowEditDialog(true)
  }

  const handleDeleteCastMember = (castMember: any) => {
    setSelectedCastMember(castMember)
    setShowDeleteDialog(true)
  }

  return (
    <div className="w-full">
      {selectedCastMembers.length > 0 && (
        <div className="bg-muted/50 mb-4 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCastMembers.length} item{selectedCastMembers.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Selected
            </Button>
            <Button variant="destructive" size="sm">
              <Trash className="mr-2 h-4 w-4" />
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
                  checked={selectedCastMembers.length === filteredCastMembers.length && filteredCastMembers.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Cast Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Productions</TableHead>
              <TableHead>Awards</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCastMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No cast members found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredCastMembers.map((castMember) => (
                <TableRow key={castMember.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCastMembers.includes(castMember.id)}
                      onCheckedChange={() => toggleSelectCastMember(castMember.id)}
                      aria-label={`Select ${castMember.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={castMember.photo} alt={castMember.name} />
                        <AvatarFallback>{castMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{castMember.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{castMember.bio}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{castMember.role}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {castMember.productions.slice(0, 2).map((production) => (
                        <div key={production.id} className="text-sm">
                          <span className="font-medium">{production.title}</span>
                          <span className="text-muted-foreground"> ({production.type})</span>
                        </div>
                      ))}
                      {castMember.productions.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{castMember.productions.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {castMember.awards.slice(0, 2).map((award, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {award}
                        </Badge>
                      ))}
                      {castMember.awards.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{castMember.awards.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {castMember.featured ? (
                      <Badge className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </Badge>
                    ) : (
                      <Badge variant="outline">Regular</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewProfile(castMember)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCastMember(castMember)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCastMember(castMember)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Profile Dialog */}
      {selectedCastMember && (
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Cast Member Profile</DialogTitle>
            </DialogHeader>
            <CastMemberProfile castMember={selectedCastMember} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowProfileDialog(false)
                  handleEditCastMember(selectedCastMember)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Cast Member Dialog */}
      {selectedCastMember && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Cast Member</DialogTitle>
              <DialogDescription>Update information for {selectedCastMember.name}</DialogDescription>
            </DialogHeader>
            {/* <CastMemberForm castMember={selectedCastMember} /> */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditDialog(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedCastMember && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedCastMember.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
