"use client"

import type React from "react"

/**
 * Loading Spinner Component
 * Displays during video buffering and initial load
 */
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
      </div>
    </div>
  )
}
