"use client";

import { cn } from "@/lib/utils";
import axios from "axios";
import { FileText } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AudioTrackUploaderProps {
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
}

export function AudioTrackUploader({
  onUploadComplete,
  disabled = false,
}: AudioTrackUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file extension
    const fileName = file.name.toLowerCase();
    if (
      !fileName.endsWith(".m4a") &&
      !fileName.endsWith(".wav") &&
      !fileName.endsWith(".mp3")
    ) {
      toast.error("Please upload a .m4a,.wav or .mp3 file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload/audio-track", formData);
      onUploadComplete(response.data.url);
      toast.success("Audio Track file uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".m4a,.wav,.mp3,audio/m4a,audio/x-wav, audio/wav, audio/mp3"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {isUploading ? (
          <>
            <div className="loader" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "p-3 rounded-full",
                isDragging ? "bg-primary/30 border-primary" : "bg-muted"
              )}
            >
              <FileText
                className={cn(
                  "size-6 text-muted-foreground",
                  isDragging && "text-white"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop your audio track file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse (.m4a, .wav, .mp3)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
