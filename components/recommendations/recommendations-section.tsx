"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { RecommendationSection } from "./recommendation-section";

interface RecommendationResult {
  contentId: string;
  name: string;
  score: number;
  reason: string;
  thumbnailImageUrl: string;
  genre: string[];
  averageRating?: number;
  type: string;
}

interface MixedRecommendations {
  continueWatching: RecommendationResult[];
  forYou: RecommendationResult[];
  trending: RecommendationResult[];
  becauseYouWatched: RecommendationResult[];
}

export function RecommendationsSection() {
  const [recommendations, setRecommendations] =
    useState<MixedRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recommendations?type=mixed");

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (
    seriesId: string,
    interaction: "view" | "rate" | "complete",
  ) => {
    try {
      await axios.post("/api/recommendations", {
        seriesId,
        eventType: interaction.toUpperCase(),
        properties: {
          timestamp: new Date().toISOString(),
          interactionType: interaction,
        },
      });
    } catch (err) {
      console.error("Failed to track interaction:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse mx-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <div
                  key={j}
                  className="flex-none w-64 h-36 bg-muted rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-4">Error loading recommendations</div>
        <Button onClick={fetchRecommendations}>Try Again</Button>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-12 mx-6">
      {Array.isArray(recommendations.forYou) &&
        recommendations.forYou.length > 0 && (
          <RecommendationSection
            title="Recommended for You"
            items={recommendations.forYou}
            onItemClick={(contentId) => trackInteraction(contentId, "view")}
          />
        )}

      {Array.isArray(recommendations.trending) &&
        recommendations.trending.length > 0 && (
          <RecommendationSection
            title="Trending Now"
            items={recommendations.trending}
            onItemClick={(contentId) => trackInteraction(contentId, "view")}
          />
        )}

      {Array.isArray(recommendations.becauseYouWatched) &&
        recommendations.becauseYouWatched.length > 0 && (
          <RecommendationSection
            title="Because You Watched Similar Content"
            items={recommendations.becauseYouWatched}
            onItemClick={(contentId) => trackInteraction(contentId, "view")}
          />
        )}
    </div>
  );
}
