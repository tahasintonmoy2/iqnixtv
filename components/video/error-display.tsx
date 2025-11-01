"use client"

import type React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import type { VideoError } from "@/lib/video-player-utils"

export interface ErrorDisplayProps {
  error: VideoError
  onRetry?: () => void
  onGoHome?: () => void
  retryCount?: number
  maxRetries?: number
}

/**
 * Error Display Component
 * Shows user-friendly error messages with recovery options
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const canRetry = retryCount < maxRetries

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />

        <div>
          <h3 className="text-white font-semibold text-lg">Unable to Play Video</h3>
          <p className="text-white/70 text-sm mt-2">{error.message}</p>
          {canRetry && (
            <p className="text-white/50 text-xs mt-2">
              Attempt {retryCount + 1} of {maxRetries}
            </p>
          )}
        </div>

        {/* Error Details */}
        <div className="bg-black/40 rounded-lg p-3 text-left">
          <p className="text-white/60 text-xs font-mono">
            <span className="text-white/80">Error Code:</span> {error.code || "UNKNOWN"}
          </p>
          <p className="text-white/60 text-xs font-mono mt-1">
            <span className="text-white/80">Type:</span> {error.type}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center pt-2">
          {onRetry && canRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              aria-label="Retry loading video"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              aria-label="Go to home page"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-white/50 text-xs space-y-1 pt-2">
          <p>If the problem persists:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your internet connection</li>
            <li>Try a different browser</li>
            <li>Clear your browser cache</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
