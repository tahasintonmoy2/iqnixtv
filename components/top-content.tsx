import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>S1</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">The Adventure Begins</p>
          <p className="text-sm text-muted-foreground">Season 1, Episode 1</p>
        </div>
        <div className="ml-auto font-medium">24.5K views</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Journey to the Unknown</p>
          <p className="text-sm text-muted-foreground">Movie</p>
        </div>
        <div className="ml-auto font-medium">18.3K views</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>S2</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">The Revelation</p>
          <p className="text-sm text-muted-foreground">Season 2, Episode 5</p>
        </div>
        <div className="ml-auto font-medium">16.9K views</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Star Travelers</p>
          <p className="text-sm text-muted-foreground">Movie</p>
        </div>
        <div className="ml-auto font-medium">12.2K views</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>S3</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Final Countdown</p>
          <p className="text-sm text-muted-foreground">Season 3, Episode 10</p>
        </div>
        <div className="ml-auto font-medium">10.1K views</div>
      </div>
    </div>
  )
}
