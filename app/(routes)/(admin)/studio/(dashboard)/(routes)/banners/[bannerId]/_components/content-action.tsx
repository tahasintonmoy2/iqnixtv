"use client";

import { Button } from "@/components/ui/button";
import { SeriesBanner } from "@/lib/generated/prisma";
import axios from "axios";
import { Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ContentActionProps {
  banner: SeriesBanner;
  bannerId: string;
  isComplete: boolean;
}

export const ContentAction = ({ banner, isComplete, bannerId }: ContentActionProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);

    try {
      if (banner.isPublished) {
        await axios.patch(`/api/series/banner/${bannerId}/unpublish`);
        toast.success("Series has been unpublished");
        router.refresh();
      } else {
        await axios.patch(`/api/series/banner/${bannerId}/publish`);
        toast.success("Series has been published");
        router.refresh();
      }
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong.", {
        description: "Failed to publish. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={onSubmit} disabled={!isComplete}>
        {banner.isPublished ? (
          <>
            {isLoading ? (
              <div className="loader"></div>
            ) : (
              <div className="flex items-center gap-x-2">
                <Lock className="size-4" />
                Unpublic
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
              <div className="loader"></div>
            ) : (
              <div className="flex items-center gap-x-2">
                <Globe className="size-4" />
                Public
              </div>
            )}
          </>
        )}
      </Button>
    </div>
  );
};
