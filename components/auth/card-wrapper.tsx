"use client";

import { BackButton } from "@/components/auth/back-button";
import { Header } from "@/components/auth/header";
import { SocialButton } from "@/components/auth/social";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  description: string;
  backButtonLabel: string;
  backButtonHref: string;
  footerText: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  description,
  backButtonLabel,
  backButtonHref,
  footerText,
  showSocial = false,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-md py-4">
      <CardHeader>
        <Header title={headerLabel} />
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <>
          <div>
            <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border uppercase">
              or
            </p>
          </div>
          <SocialButton />
        </>
      )}
      <CardFooter>
        <div className="flex items-center justify-center w-full">
          <p>{footerText}</p>
          <BackButton label={backButtonLabel} href={backButtonHref} />
        </div>
      </CardFooter>
    </Card>
  );
};
