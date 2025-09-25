"use client"

import { Episode, Season } from "@/types"

interface DebugDataProps {
  season: Season
  episode: Episode
}

export function DebugData({ season, episode }: DebugDataProps) {
  return (
    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Debug Data</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Season Data:</h4>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(season, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Episode Data:</h4>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(episode, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 text-sm">
        <p><strong>Season Name:</strong> {season.name}</p>
        <p><strong>Season Number:</strong> {season.seasonNumber}</p>
        <p><strong>Episode Name:</strong> {episode.name}</p>
        <p><strong>Episode Number:</strong> {episode.episodeNumber}</p>
        <p><strong>Video URL:</strong> {episode.videoUrl}</p>
      </div>
    </div>
  )
} 