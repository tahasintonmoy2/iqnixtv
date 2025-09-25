import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";

interface FormErrorProps {
  message?: string;
  onDismiss?: () => void;
}

export function FileError({ message, onDismiss }: FormErrorProps) {
  if (!message) return;

  return (
    <div className="flex items-center font-medium p-2 border text-red-600 border-red-500 bg-red-800/35 rounded-sm">
      <ExclamationTriangleIcon className="mr-2 h-5 w-5" />
      <p>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="h-auto ml-auto flex justify-end">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
