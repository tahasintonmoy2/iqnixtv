"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Season page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="py-4 bg-transparent border-0">
            <div className="w-full max-w-md text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <div className="text-2xl">Something went wrong</div>
              <div>
                We encountered an error while loading the episode. Please try again.
              </div>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Go to Home
                </Button>
                <Button onClick={reset}>
                  <RefreshCw className="size-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
