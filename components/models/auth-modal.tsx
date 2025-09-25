"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { Button } from "../ui/button";
import Link from "next/link";
import { LogoGoogle } from "../icons";
import { Mail } from "lucide-react";

export const AuthModal = () => {
  const { isOpen, onClose } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Login</DialogTitle>
          <DialogDescription className="text-center">
            Log in to manage your account, and synchronize watching history and
            favorites on multi-devices.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          <Link href="/auth/sign-in">
            <Button
              className="dark:bg-white dark:text-black w-[11rem] mb-4"
              size="lg"
            >
              <Mail className="size-4" />
              Login with Email
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="w-[11rem] dark:bg-white dark:text-black"
          >
            <LogoGoogle />
            Login with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
