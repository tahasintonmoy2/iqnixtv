"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, MoreHorizontal, Play } from 'lucide-react'
import Image from "next/image"

const recentlyWatched = [
  {
    id: "1",
    title: "Mystic Valley",
    episode: "S1 E5: The Revelation",
    progress: 75,
    duration: "45 min",
    thumbnail: "/placeholder.svg?height=80&width=140",
    lastWatched: "2 hours ago",
  },
  {
    id: "2",
    title: "The Last Kingdom",
    episode: "S2 E3: The Battle",
    progress: 100,
    duration: "50 min",
    thumbnail: "/placeholder.svg?height=80&width=140",
    lastWatched: "Yesterday",
  },
  {
    id: "3",
    title: "Echoes of Time",
    episode: "S1 E8: Time Paradox",
    progress: 30,
    duration: "42 min",
    thumbnail: "/placeholder.svg?height=80&width=140",
    lastWatched: "3 days ago",
  },
]

export function WatchingHistory() {
  return (
    <Card className="py-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Continue Watching
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentlyWatched.map((item) => (
            <div key={item.id} className="flex items-center gap-4 group">
              <div className="relative">
                <Image
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  width={24}
                  height={14}
                  className="w-24 h-14 rounded object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
                <Progress 
                  value={item.progress} 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-none" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{item.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{item.episode}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{item.duration}</span>
                  <span>•</span>
                  <span>{item.lastWatched}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
