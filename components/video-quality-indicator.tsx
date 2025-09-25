"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatBandwidth } from "@/lib/bandwidth-detection"

type VideoQualityIndicatorProps = {
  quality: string
  bandwidth: number | null
  isAuto: boolean
}

export function VideoQualityIndicator({ quality, bandwidth, isAuto }: VideoQualityIndicatorProps) {
  const [visible, setVisible] = useState(true)

  // Hide the indicator after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [quality, bandwidth])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-md px-3 py-2 text-white text-sm z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col">
          <div className="font-medium">
            Quality: {quality}
            {isAuto && <span className="text-xs ml-1">(Auto)</span>}
          </div>
          {bandwidth && isAuto && (
            <div className="text-xs text-white/70 mt-1">Network: {formatBandwidth(bandwidth)}</div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
