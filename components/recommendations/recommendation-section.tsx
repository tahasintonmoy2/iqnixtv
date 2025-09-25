import { RecommendationResult } from "@/lib/recommendation-service";
import { SectionCarousel } from "./section-carousel";
import { ContentCard } from "./content-card";

interface RecommendationSectionProps {
  title: string;
  items: RecommendationResult[];
  onItemClick: (contentId: string) => void;
}

export const RecommendationSection = ({ title, items, onItemClick }: RecommendationSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <SectionCarousel>
        {items.map((item) => (
          <ContentCard
            key={item.contentId}
            content={item}
            onClick={() => onItemClick(item.contentId)}
          />
        ))}
      </SectionCarousel>
    </div>
  );
}
