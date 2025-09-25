import { GalleryVerticalEnd, XCircle } from "lucide-react";

import Image from "next/image";

export default function ErrorPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Iqnix TV CMS.
          </a>
        </div>
        <div className="flex flex-col justify-center text-center max-w-96 items-center font-medium p-2 border text-red-700 border-red-500 bg-red-800/35 rounded-sm">
          <XCircle className="h-6 w-6" />
          <p>You cannot use the same email. Please try again.</p>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/web-storm.png"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
