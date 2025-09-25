"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

import { FileUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import { Series } from "@/lib/generated/prisma";
import { ImageIcon, PencilIcon, Plus } from "lucide-react";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

interface ImageFormPops {
  initialData: Series;
}

export const formSchema = z.object({
  bannerImageUrl: z.string(),
});

export const SeriesBannerImageForm = ({
  initialData,
}: ImageFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/${initialData.id}`, values);
      toast.success("Series banner image uploaded!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload banner image");
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 w-80">
      <div className="font-medium flex items-center justify-between">
        Banner image
        <Button variant="ghost" onClick={toggleEdit} className="mb-4">
          {isEditing && (
            <>
              <MdClose className="h-5 w-5" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.bannerImageUrl && (
            <>
              <Plus className="h-4 w-4" />
              Add an Image
            </>
          )}
          {!isEditing && initialData.bannerImageUrl && (
            <>
              <PencilIcon className="h-4 w-4" />
              Change Image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.bannerImageUrl ? (
          <div className="flex justify-center items-center h-60 bg-muted rounded-md">
            <ImageIcon className="size-10" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              src={initialData.bannerImageUrl}
              alt=""
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <div className="border border-dashed rounded-md">
            <FileUpload
              endPoint="videoImage"
              onChange={(url) => {
                if (url) {
                  onSubmit({ bannerImageUrl: url });
                }
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:9 aspect ratio recommended</p>
          </div>
        </div>
      )}
    </div>
  );
};