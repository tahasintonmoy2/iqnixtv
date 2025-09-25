import { CheckCircle, X } from "lucide-react";

interface FormSuccessProps {
  message?: string;
  onDismiss?: () => void;
}

export function FileSuccess({ message, onDismiss }: FormSuccessProps) {
  if (!message) return;

  return (
    <div className="flex items-center font-medium p-2 border text-green-600 border-green-500 bg-green-700/35 rounded-sm">
      <CheckCircle className="mr-2 h-5 w-5" />
      <p>{message}</p>
      {onDismiss && (
        <button className="text-green-600 flex justify-end">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
