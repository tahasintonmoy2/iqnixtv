"use client"
import { CheckCircle2, Clock, FileVideo, MoreHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

export function UploadsList() {
  // Mock data for uploads
  const uploads = [
    {
      id: "1",
      title: "Mystery of the Deep",
      type: "Movie",
      fileSize: "2.4 GB",
      uploadDate: "2023-10-15",
      status: "processing",
      progress: 65,
    },
    {
      id: "2",
      title: "New Horizons",
      type: "Series - S04E01",
      fileSize: "1.2 GB",
      uploadDate: "2023-10-14",
      status: "complete",
      progress: 100,
    },
    {
      id: "3",
      title: "Deep Space Explorers",
      type: "Documentary",
      fileSize: "1.8 GB",
      uploadDate: "2023-10-12",
      status: "complete",
      progress: 100,
    },
    {
      id: "4",
      title: "Legends of Tomorrow",
      type: "Movie",
      fileSize: "2.1 GB",
      uploadDate: "2023-10-10",
      status: "failed",
      progress: 45,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {uploads.map((upload) => (
        <Card key={upload.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FileVideo className="mr-2 h-5 w-5 text-muted-foreground" />
                  {upload.title}
                </CardTitle>
                <CardDescription>{upload.type}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  {upload.status === "failed" && <DropdownMenuItem>Retry Upload</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Cancel Upload</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div>Size: {upload.fileSize}</div>
                <div>Uploaded: {upload.uploadDate}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {upload.status === "processing" && <Clock className="mr-2 h-4 w-4 text-muted-foreground" />}
                    {upload.status === "complete" && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
                    {upload.status === "failed" && <X className="mr-2 h-4 w-4 text-destructive" />}
                    <span className="capitalize">{upload.status}</span>
                  </div>
                  <Badge
                    variant={
                      upload.status === "complete"
                        ? "default"
                        : upload.status === "processing"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {upload.status === "complete" ? "Ready" : upload.status}
                  </Badge>
                </div>
                <Progress value={upload.progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">{upload.progress}% complete</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              variant={upload.status === "failed" ? "default" : "outline"}
              size="sm"
              className="w-full"
              disabled={upload.status === "processing"}
            >
              {upload.status === "failed" ? "Retry Upload" : "View Details"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
