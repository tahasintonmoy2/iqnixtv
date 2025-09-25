"use client";

import React from "react";
import { LogoGoogle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFALUT_LOGIN_REDIRECT } from "@/routes";

export const SocialButton = () => {
  const onClick = (provider: "google") => {
    signIn(provider, {
      redirectTo: DEFALUT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex items-center justify-center w-full gap-x-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => onClick("google")}
      >
        <LogoGoogle className="mr-2" />
        Continue with Google
      </Button>
    </div>
  );
};
