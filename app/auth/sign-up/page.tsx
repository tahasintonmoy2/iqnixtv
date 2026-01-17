import { SignUpForm } from "@/components/auth/sign-up-form";
import Logo from "@/components/logo";
import { siteConfig } from "@/config/site";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign Up",
  description: siteConfig.description,
};

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo href="/" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full lg:max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-l-2xl overflow-hidden my-2">
        <Image
          src="/martin-martz-qzfu2K5Iz7I-unsplash.jpg"
          alt="Image"
          fill
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
