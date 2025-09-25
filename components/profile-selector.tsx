"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle } from "lucide-react"

type Profile = {
  id: string
  name: string
  avatar: string
  color: string
}

export function ProfileSelector() {
  const router = useRouter()
  const [profiles] = useState<Profile[]>([
    {
      id: "1",
      name: "User 1",
      avatar: "/placeholder.svg?height=100&width=100",
      color: "bg-red-500",
    },
    {
      id: "2",
      name: "User 2",
      avatar: "/placeholder.svg?height=100&width=100",
      color: "bg-blue-500",
    },
    {
      id: "3",
      name: "User 3",
      avatar: "/placeholder.svg?height=100&width=100",
      color: "bg-green-500",
    },
    {
      id: "4",
      name: "Kids",
      avatar: "/placeholder.svg?height=100&width=100",
      color: "bg-yellow-500",
    },
  ])

  const handleProfileSelect = (profileId: string) => {
    // In a real app, you would set the active profile in state/context
    router.push("/")
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          className="flex flex-col items-center gap-3 transition-transform hover:scale-105"
          onClick={() => handleProfileSelect(profile.id)}
        >
          <div className={`rounded-md p-1 ${profile.color}`}>
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-3xl">{profile.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-lg font-medium">{profile.name}</span>
        </button>
      ))}

      <button className="flex flex-col items-center gap-3 transition-transform hover:scale-105">
        <div className="rounded-md p-1 bg-muted">
          <div className="h-24 w-24 md:h-32 md:w-32 flex items-center justify-center">
            <PlusCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <span className="text-lg font-medium">Add Profile</span>
      </button>
    </div>
  )
}
