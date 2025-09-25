"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

import { FileUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import { SeriesBanner } from "@/lib/generated/prisma";
import { getError } from "@/lib/get-error-message";
import { ImageIcon, PencilIcon, Plus } from "lucide-react";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

interface ImageFormPops {
  initialData: SeriesBanner;
  bannerId: string
}

export const formSchema = z.object({
  bannerImageUrl: z.string(),
});

export const SeriesImageForm = ({
  initialData,
  bannerId
}: ImageFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/banner/${bannerId}`, values);
      toast.success("Series image uploaded!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4 w-96 overflow-hidden">
      <div className="font-medium flex items-center justify-between">
        Banner image
        <Button variant="ghost" onClick={toggleEdit} className="mb-4">
          {isEditing && (
            <>
              <MdClose className="size-5" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.bannerImageUrl && (
            <>
              <Plus className="size-4" />
              Add an Image
            </>
          )}
          {!isEditing && initialData.bannerImageUrl && (
            <>
              <PencilIcon className="size-4" />
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
          {/* <div className="text-xs text-muted-foreground mt-4">
            <p>16:9 aspect ratio recommended</p>
          </div> */}
        </div>
      )}
    </div>
  );
};