import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  progress?: number;
  message?: string;
  isIndeterminate?: boolean;
}

export const UploadProgress = ({
  progress = 0,
  message = "Uploading...",
  isIndeterminate = false,
}: UploadProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="loader-lt"></div>
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      {!isIndeterminate && <Progress value={progress} className="h-2" />}
    </div>
  );
};
