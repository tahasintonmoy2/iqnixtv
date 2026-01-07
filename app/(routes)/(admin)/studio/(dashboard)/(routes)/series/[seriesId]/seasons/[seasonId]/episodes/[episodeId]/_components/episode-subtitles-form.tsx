"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

import { SubtitleUploader } from "@/components/subtitle-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubtitleTrack } from "@/lib/generated/prisma";
import { getError } from "@/lib/get-error-message";
import { CheckCircle, Clock, FileIcon, Plus, Upload, X } from "lucide-react";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

interface EpisodeSubtitlesFormProps {
  initialData: SubtitleTrack[];
  episodeId: string;
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ko", label: "Korean" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
];

export const formSchema = z.object({
  url: z.string(),
  name: z.string().min(1),
  languageCode: z.string().min(2),
});

export const EpisodeSubtitlesForm = ({
  initialData,
  episodeId,
}: EpisodeSubtitlesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [subtitleName, setSubtitleName] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const router = useRouter();

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    setUploadedUrl("");
    setSubtitleName("");
    setLanguageCode("en");
  };

  const onSubmitManual = async () => {
    if (!uploadedUrl || !subtitleName || !languageCode) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`/api/series/subtitles`, {
        url: uploadedUrl,
        name: subtitleName,
        languageCode,
        episodeId,
        mode: "manual",
      });
      toast.success("Subtitle uploaded successfully!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageLabel = (code: string) => {
    return LANGUAGE_OPTIONS.find((l) => l.value === code)?.value || code;
  };

  return (
    <div className="mt-6 border rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Subtitles
        <Button variant="ghost" onClick={toggleEdit} className="mb-4">
          {isEditing && (
            <>
              <MdClose className="h-5 w-5" />
              Cancel
            </>
          )}
          {!isEditing && (
            <>
              <Plus className="size-4" />
              Add Subtitle
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (initialData.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-6">
            <FileIcon className="size-8 text-muted-foreground" />
            <h1 className="text-muted-foreground mt-2">No subtitle files</h1>
          </div>
        ) : (
          <div className="rounded-lg border">
            {initialData.map((subtitle) => (
              <div
                className="flex items-center justify-between p-4 border-b last:border-b-0"
                key={subtitle.id}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{subtitle.name}</span>
                  <div className="flex items-center gap-x-2">
                    <Badge variant="outline">
                      {getLanguageLabel(subtitle.languageCode)}
                    </Badge>
                    <Badge
                      variant={
                        subtitle.status === "ready" ? "default" : "outline"
                      }
                      className="capitalize"
                    >
                      {subtitle.status === "ready" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="size-3" />
                          Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Preparing
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {isEditing && (
        <div className="w-full">
          <div className="space-y-2">
            <Label>Subtitle Name</Label>
            <Input
              placeholder="e.g., English Subtitles"
              value={subtitleName}
              onChange={(e) => setSubtitleName(e.target.value)}
            />
          </div>

          <div className="space-y-2 my-4">
            <Label>Language</Label>
            <Select value={languageCode} onValueChange={setLanguageCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subtitle File</Label>
            {uploadedUrl ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileIcon className="h-4 w-4" />
                <span className="text-sm truncate flex-1">File uploaded</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <SubtitleUploader
                onUploadComplete={(url) => setUploadedUrl(url)}
                disabled={isLoading}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: SRT, WebVTT
            </p>
          </div>

          <Button
            onClick={onSubmitManual}
            disabled={isLoading || !uploadedUrl || !subtitleName}
            className="w-full mt-2"
          >
            {isLoading ? (
              <div className="loader" />
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Subtitle
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
