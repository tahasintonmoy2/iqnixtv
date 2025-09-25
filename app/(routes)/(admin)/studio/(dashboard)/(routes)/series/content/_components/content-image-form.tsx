"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import * as z from "zod";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageIcon, PencilIcon, PlusCircle } from "lucide-react";
import { MdClose } from "react-icons/md";
import { getError } from "@/lib/get-error-message";
import { Series } from "@/lib/generated/prisma";
import { FileUpload } from "@/components/media-upload";

interface ImageFormPops {
  initialData: Series;
}

const formSchema = z.object({
  thumbnailImageUrl: z.string().min(10, {
    message: "Image URL is required and must be at least 10 characters",
  }),
});

export const SeriesImageForm = ({
  initialData,
}: ImageFormPops) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/series/${initialData.id}`, values);
      toast.success("Series image uploaded!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    }
  };

  return (
    <div className="mt-6 border rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Series Image
        <Button variant="ghost" onClick={toggleEdit}>
          {isEditing && (
            <>
              <MdClose className="h-5 w-5 mr-2" />
              Cancel
            </>
          )}
          {!isEditing && !initialData.thumbnailImageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an Image
            </>
          )}
          {!isEditing && initialData.thumbnailImageUrl && (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Change Image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.thumbnailImageUrl ? (
          <div className="flex justify-center items-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-700" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              src={initialData.thumbnailImageUrl}
              alt=""
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <FileUpload
            endPoint="videoImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ thumbnailImageUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            <p>16:9 aspect ratio recommended</p>
          </div>
        </div>
      )}
    </div>
  );
};