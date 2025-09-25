"use client";

import { UploadButton } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endPoint: keyof typeof ourFileRouter;
}

export const FileUploadButton = ({
  onChange,
  endPoint
}: FileUploadProps) => {
  return (
    <UploadButton
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].ufsUrl);
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  );
};