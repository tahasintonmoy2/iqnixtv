import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          {/* Loading spinner */}
          <div className="flex flex-col items-center space-y-4">
            <div className="loader-lg" />
            <p className="text-lg font-medium text-muted-foreground">
              Loading content...
            </p>
          </div>

          {/* Skeleton content */}
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
