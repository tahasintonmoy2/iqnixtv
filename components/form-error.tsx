import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return;

  return (
    <div className="flex max-w-96 items-center font-medium p-2 border text-red-600 border-red-500 bg-red-800/35 rounded-sm">
      <ExclamationTriangleIcon className='mr-2 h-5 w-5'/>
      <p>{message}</p>
    </div>
  );
}