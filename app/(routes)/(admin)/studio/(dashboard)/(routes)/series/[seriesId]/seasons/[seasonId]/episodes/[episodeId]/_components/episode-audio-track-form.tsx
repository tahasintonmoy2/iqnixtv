"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

import { AudioTrackUploader } from "@/components/audio-track-uploader";
import { DeleteAudioTrackModel } from "@/components/models/delete-audio-track-model";
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
import { useDeleteAudioTrackModal } from "@/hooks/use-delete-audio-track";
import { AudioTrack } from "@/lib/generated/prisma";
import { getTrackDisplayInfo } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  FileIcon,
  Plus,
  Trash,
  Upload,
  X,
} from "lucide-react";
import { MdClose } from "react-icons/md";
import { toast } from "sonner";

interface EpisodeAudioTrackFormProps {
  initialData: AudioTrack[];
  episodeId: string;
  seriesId: string;
  seasonId: string;
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

export const EpisodeAudioTrackForm = ({
  initialData,
  episodeId,
  seasonId,
  seriesId,
}: EpisodeAudioTrackFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [audioTrackName, setAudioTrackName] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [originalAudioTrackName, setOriginalAudioTrackName] = useState("");
  const [primaryLanguageCode, setPrimaryLanguageCode] = useState("en");
  const router = useRouter();
  const deleteAudioTrackModal = useDeleteAudioTrackModal();

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    setUploadedUrl("");
    setAudioTrackName("");
    setLanguageCode("en");
    setOriginalAudioTrackName("");
    setPrimaryLanguageCode("en");
  };

  const onSubmitUpload = async () => {
    if (
      !uploadedUrl ||
      !audioTrackName ||
      !languageCode ||
      !originalAudioTrackName ||
      !primaryLanguageCode
    ) {
      toast.error("Please fill all fields including original track info");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`/api/series/multi-track-audio`, {
        url: uploadedUrl,
        name: audioTrackName,
        languageCode,
        episodeId,
      });
      await axios.patch(
        `/api/series/${seriesId}/season/${seasonId}/episode/${episodeId}`,
        {
          name: originalAudioTrackName,
          languageCode: primaryLanguageCode,
        }
      );

      toast.success("Audio Track uploaded successfully!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload audio track file");
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
        Audio Tracks
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
            <h1 className="text-muted-foreground mt-2">No audioTrack files</h1>
          </div>
        ) : (
          <div className="rounded-lg border">
            {initialData.map((audioTrack) => {
              const displayInfo = getTrackDisplayInfo(audioTrack);

              return (
                <div
                  className="flex items-center justify-between p-4 border-b last:border-b-0"
                  key={audioTrack.id}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {displayInfo.label}
                    </span>
                    <div className="flex items-center gap-x-2">
                      <Badge variant="outline">
                        {getLanguageLabel(audioTrack.languageCode)}
                      </Badge>
                      <Badge
                        variant={
                          audioTrack.status === "ready" ? "default" : "outline"
                        }
                        className="capitalize"
                      >
                        {audioTrack.status === "ready" ? (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAudioTrackModal.onOpen(audioTrack.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ))}

      {isEditing && (
        <div className="w-full">
          <div className="space-y-2">
            <Label>Audio Track Name</Label>
            <Input
              placeholder="e.g., English audio tracks"
              value={audioTrackName}
              required
              onChange={(e) => setAudioTrackName(e.target.value)}
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
            <Label>Original Audio Track Name</Label>
            <Input
              placeholder="e.g., English audio tracks"
              value={originalAudioTrackName}
              required
              onChange={(e) => setOriginalAudioTrackName(e.target.value)}
            />
          </div>

          <div className="space-y-2 my-4">
            <Label>Original Language</Label>
            <Select
              value={primaryLanguageCode}
              onValueChange={setPrimaryLanguageCode}
            >
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
            <Label>Audio Track File</Label>
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
              <AudioTrackUploader
                onUploadComplete={(url) => setUploadedUrl(url)}
                disabled={isLoading}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: .m4a,.wav,.mp3
            </p>
          </div>

          <Button
            onClick={onSubmitUpload}
            disabled={isLoading || !uploadedUrl || !audioTrackName}
            className="w-full mt-2"
          >
            {isLoading ? (
              <div className="loader" />
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Audio Track
              </>
            )}
          </Button>
        </div>
      )}
      <DeleteAudioTrackModel />
    </div>
  );
};
