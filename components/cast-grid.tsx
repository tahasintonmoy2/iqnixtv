"use client"

import { Edit, MoreHorizontal, Star, Trash } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import { CastMemberProfile } from "@/components/cast-member-profile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Cast } from "@/lib/generated/prisma"
import { useRouter } from "next/navigation"

interface CastGridProps {
  searchQuery?: string
  filters?: Record<string, string>
  data: Cast[]
}

export function CastGrid({ searchQuery = "", filters = {}, data }: CastGridProps) {
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCastMember, setSelectedCastMember] = useState<Cast | null>(null)
  const [filteredCastMembers, setFilteredCastMembers] = useState(data)
  const router = useRouter();

  // Filter cast members based on search query and filters
  useEffect(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.bio?.toLowerCase().includes(query) ||
          member.career.toLowerCase().includes(query)
      )
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter((member) => member.career.toLowerCase() === filters.role.toLowerCase())
    }

    // Apply featured filter
    if (filters.featured === "featured") {
      result = result.filter((member) => member.isFeatured)
    } else if (filters.featured === "regular") {
      result = result.filter((member) => !member.isFeatured)
    }

    // Apply date filter
    if (filters.date) {
      // In a real app, you would filter by date
      // This is just a placeholder implementation
      console.log("Date filter applied:", filters.date)
    }

    setFilteredCastMembers(result)
  }, [searchQuery, filters, data])

  const handleViewProfile = (castMember: Cast) => {
    setSelectedCastMember(castMember)
    setShowProfileDialog(true)
  }

  const handleDeleteCastMember = (castMember: Cast) => {
    setSelectedCastMember(castMember)
    setShowDeleteDialog(true)
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredCastMembers.length === 0 ? (
        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No cast members found matching your criteria.</p>
        </div>
      ) : (
        filteredCastMembers.map((castMember) => (
          <Card key={castMember.id} className="overflow-hidden py-0">
            <div className="relative aspect-square">
              <Image src={castMember.image || "/placeholder.svg"} alt={castMember.name} fill className="object-cover" />
              {castMember.isFeatured && (
                <div className="absolute top-2 right-2">
                  <Badge className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{castMember.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{castMember.career}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/cast/${data[0].id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCastMember(castMember)}>
                      <Trash className="mr-2 size-4 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-sm line-clamp-2">{castMember.bio}</p>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewProfile(castMember)}>
                View Profile
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {/* View Profile Dialog */}
      {selectedCastMember && (
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="sm:max-w-[700px] h-[600px] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle>Cast Member Profile</DialogTitle>
            </DialogHeader>
            <CastMemberProfile castMember={selectedCastMember} />
            <DialogFooter>
              <Button variant="outline" onClick={()=> setShowProfileDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => router.push(`/cast/${data[0].id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
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
