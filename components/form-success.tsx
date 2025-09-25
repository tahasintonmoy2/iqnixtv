import { CheckCircle } from 'lucide-react';

interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return;

  return (
    <div className="flex max-w-96 items-center font-medium p-2 border text-green-600 border-green-500 bg-green-700/35 rounded-sm">
      <CheckCircle className='mr-2 h-5 w-5'/>
      <p>{message}</p>
    </div>
  );
}