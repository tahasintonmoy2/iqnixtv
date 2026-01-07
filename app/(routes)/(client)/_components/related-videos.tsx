import { TrailersSection } from "@/components/trailers-section";
import { MuxData, Trailers } from "@/lib/generated/prisma";
import React from "react";

interface RelatedVideosProps {
  trailers: (Trailers & {
    duration?: number;
  } & MuxData)[];
}

export const RelatedVideos = ({ trailers }: RelatedVideosProps) => {
  return (
    <div>
      {trailers.length > 0 && (
        <div>
          <TrailersSection trailers={trailers} />
        </div>
      )}
    </div>
  );
};
