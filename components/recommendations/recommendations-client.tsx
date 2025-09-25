'use client';

import axios from "axios";
import { useState } from "react";
import { ContentCard } from "./content-card";
import { SectionCarousel } from "./section-carousel";
import { Button } from "../ui/button";

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

export function RecommendationsClient() {
  const [recommendations, setRecommendations] = useState<RecommendationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchRecommendations = async (filter: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/recommendations?type=${filter}`);
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch recommendations');
      }

      setRecommendations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const trackInteraction = async (contentId: string, interaction: 'view' | 'rate' | 'complete') => {
    try {
    await axios.post('/api/recommendations', { contentId, interaction });
    } catch (err) {
      console.error('Failed to track interaction:', err);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4 text-lg">Failed to load recommendations</div>
        <Button
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Render single category recommendations
  return (
    <div className="space-y-8">
      {loading ? (
        <div className="space-y-4">
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="flex-none space-y-3">
                <div className="w-64 h-36 bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-gray-800 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
        <SectionCarousel>
          {recommendations.map((item: RecommendationResult) => (
            <ContentCard
              key={item.contentId}
              content={item}
              onClick={() => trackInteraction(item.contentId, 'view')}
            />
          ))}
        </SectionCarousel>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg mb-4">No recommendations found</div>
          <p className="text-muted-foreground">
            Try watching some content to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
}