"use client"

import { Calendar, MapPin, Star, User } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cast } from "@/lib/generated/prisma"

interface CastMemberProfileProps {
  castMember: Cast
}

export function CastMemberProfile({ castMember }: CastMemberProfileProps) {
  return (
    <div className="space-y-6 bg-card">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative h-48 w-48 overflow-hidden rounded-lg">
          <Image src={castMember.image || "/placeholder.svg"} alt={castMember.name} fill className="object-cover" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{castMember.name}</h2>
              <p className="text-muted-foreground">{castMember.career}</p>
              {castMember.alsoKnownAs && (
                <p className="text-sm text-muted-foreground">Also known as: {castMember.alsoKnownAs}</p>
              )}
            </div>
            {castMember.isFeatured && (
              <Badge className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
                <Star className="h-3 w-3 fill-current" />
                Featured Cast
              </Badge>
            )}
          </div>
          {castMember.bio && <p>{castMember.bio}</p>}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {castMember.region}
            </Badge>
            {castMember.dateOfBirth && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(castMember.dateOfBirth).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="space-y-4">
          <h3 className="text-lg font-medium">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Basic Details</h4>
              <div className="grid gap-2 rounded-lg border p-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{castMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gender:</span>
                  <span className="font-medium">{castMember.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Age:</span>
                  <span className="font-medium">{castMember.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region:</span>
                  <span className="font-medium">{castMember.region}</span>
                </div>
                {castMember.height && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Height:</span>
                    <span className="font-medium">{castMember.height}</span>
                  </div>
                )}
                {castMember.weight && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="font-medium">{castMember.weight}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Career Information</h4>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{castMember.career}</span>
                </div>
                {castMember.bio && (
                  <p className="text-sm text-muted-foreground">{castMember.bio}</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stats" className="space-y-4">
          <h3 className="text-lg font-medium">Cast Member Statistics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Profile Status</h4>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="font-medium">{castMember.isFeatured ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date(castMember.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(castMember.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Complete</p>
                  <p className="font-medium">{castMember.bio ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Platform Status</h4>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Featured Status</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{castMember.isFeatured ? "Featured" : "Regular"}</p>
                  {castMember.isFeatured && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Cast ID</p>
                  <p className="font-mono text-xs">{castMember.id}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
