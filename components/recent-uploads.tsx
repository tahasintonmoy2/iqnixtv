import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentUploads() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>M1</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Mystery of the Deep</p>
          <p className="text-sm text-muted-foreground">Movie • 2h 15m</p>
        </div>
        <div className="ml-auto">
          <Badge>Processing</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>S4</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">New Horizons</p>
          <p className="text-sm text-muted-foreground">Season 4, Episode 1 • 45m</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline">Ready</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>D1</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Deep Space Explorers</p>
          <p className="text-sm text-muted-foreground">Documentary • 1h 30m</p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary">Published</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>S2</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">The Confrontation</p>
          <p className="text-sm text-muted-foreground">Season 2, Episode 8 • 52m</p>
        </div>
        <div className="ml-auto">
          <Badge variant="secondary">Published</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>M2</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Legends of Tomorrow</p>
          <p className="text-sm text-muted-foreground">Movie • 2h 05m</p>
        </div>
        <div className="ml-auto">
          <Badge variant="destructive">Failed</Badge>
        </div>
      </div>
    </div>
  )
}
