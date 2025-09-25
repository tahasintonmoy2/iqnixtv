"use client"

import { useState } from "react"
import { Play, Pause, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Banner {
  id: string
  title: string
  type: "image" | "video"
  status: "active" | "scheduled" | "paused" | "expired"
  priority: number
  startDate: Date
  endDate: Date
  targetContent?: {
    id: string
    title: string
    type: "movie" | "series"
  }
  targeting: {
    userSegments: string[]
    categories: string[]
  }
  analytics: {
    impressions: number
    clicks: number
    ctr: number
  }
}

interface BannerPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: Banner | null
}

export function BannerPreview({ open, onOpenChange, banner }: BannerPreviewProps) {
  const [currentDevice, setCurrentDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPlaying, setIsPlaying] = useState(false)

  if (!banner) return null

  const getDeviceClass = () => {
    switch (currentDevice) {
      case "desktop":
        return "w-full max-w-4xl"
      case "tablet":
        return "w-full max-w-2xl"
      case "mobile":
        return "w-full max-w-sm"
      default:
        return "w-full max-w-4xl"
    }
  }

  const getStatusColor = (status: Banner["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "scheduled":
        return "bg-blue-500"
      case "paused":
        return "bg-yellow-500"
      case "expired":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Banner Preview: {banner.title}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getStatusColor(banner.status)} text-white`}>
                {banner.status}
              </Badge>
              <Badge variant="secondary">Priority {banner.priority}</Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Preview how your banner will appear across different devices and screen sizes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* Device Selection */}
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant={currentDevice === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDevice("desktop")}
              >
                Desktop
              </Button>
              <Button
                variant={currentDevice === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDevice("tablet")}
              >
                Tablet
              </Button>
              <Button
                variant={currentDevice === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDevice("mobile")}
              >
                Mobile
              </Button>
            </div>

            {/* Banner Preview */}
            <div className="flex justify-center">
              <div className={`${getDeviceClass()} transition-all duration-300`}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-gradient-to-r from-purple-600 to-blue-600">
                      {banner.type === "image" ? (
                        <img
                          src="/placeholder.svg?height=400&width=800"
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <div className="text-center text-white">
                            <div className="mb-4">
                              {isPlaying ? (
                                <Pause className="h-16 w-16 mx-auto" />
                              ) : (
                                <Play className="h-16 w-16 mx-auto" />
                              )}
                            </div>
                            <Button variant="secondary" onClick={() => setIsPlaying(!isPlaying)}>
                              {isPlaying ? "Pause" : "Play"} Video
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Overlay Text */}
                      <div className="absolute inset-0 flex items-end justify-start p-6">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-md">
                          <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                          {banner.targetContent && <p className="text-lg mb-4">{banner.targetContent.title}</p>}
                          <Button className="bg-red-600 hover:bg-red-700">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Preview Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Viewing {currentDevice} preview • {banner.type === "image" ? "Image" : "Video"} Banner
              </p>
              <p>
                Active: {banner.startDate.toLocaleDateString()} - {banner.endDate.toLocaleDateString()}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Title:</span>
                      <p>{banner.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <p className="capitalize">{banner.type} Banner</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                      <p>{banner.priority}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <Badge variant="outline" className={`${getStatusColor(banner.status)} text-white ml-2`}>
                        {banner.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Targeting */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Targeting</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">User Segments:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {banner.targeting.userSegments.map((segment) => (
                          <Badge key={segment} variant="secondary" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {banner.targeting.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {banner.targetContent && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Target Content:</span>
                        <p>
                          {banner.targetContent.title} ({banner.targetContent.type})
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Start Date:</span>
                      <p>{banner.startDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">End Date:</span>
                      <p>{banner.endDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                      <p>
                        {Math.ceil((banner.endDate.getTime() - banner.startDate.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Impressions:</span>
                      <p className="text-2xl font-bold">{banner.analytics.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Clicks:</span>
                      <p className="text-2xl font-bold">{banner.analytics.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Click-through Rate:</span>
                      <p className="text-2xl font-bold">{banner.analytics.ctr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
