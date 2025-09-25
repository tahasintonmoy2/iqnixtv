import { type DefaultSession } from "next-auth";
import { Subscription } from "./lib/generated/prisma";

type ExtendedUser = DefaultSession["user"] & {
  role: "ADMIN" | "USER";
  isTwoFactorEnabled: boolean;
  firstName: string;
  lastName: string;
  createdAt: Date;
  subscription: Subscription
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}