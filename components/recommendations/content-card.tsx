import { RecommendationResult } from "@/lib/recommendation-service";
import Image from "next/image";
import React, { useState } from "react";

interface ContentCardProps {
  content: RecommendationResult;
  onClick: () => void;
}

export const ContentCard = ({ content, onClick }: ContentCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="flex-none w-64 cursor-pointer group transition-transform duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="relative rounded-lg overflow-hidden bg-gray-800 shadow-lg">
        {!imageError && content.thumbnailImageUrl && (
          <Image
            src={content.thumbnailImageUrl || ""}
            alt={content.name}
            className="w-full h-[185px] object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Overlay with content info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="text-white text-sm font-medium mb-1">
              {content.averageRating && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white text-xs">
                    {content.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
            {content.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              {content.type?.replace("_", " ")}
            </span>
            {content.genre.length > 0 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400">
                  {content.genre.slice(0, 2).join(", ")}
                  {content.genre.length > 2 && "..."}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-blue-400 font-medium">
            {content.reason}
          </div>
        </div>
      </div>
    </div>
  );
};
