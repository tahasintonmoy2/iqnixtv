"use server";

import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const resetPassword = async (
  values: z.infer<typeof ResetPasswordSchema>,
  token?: string | null
) => {
  console.log("=== resetPassword called ===");
  console.log("Received token:", token);
  
  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    console.log("Schema validation failed:", validatedFields.error);
    return { error: "Invalid fields" };
  }

  if (!token || token.trim() === "") {
    console.log("Token is missing or empty");
    return { error: "Missing token" };
  }

  const { password } = validatedFields.data;

  console.log("Calling getPasswordResetTokenByToken with token:", token.trim());
  const existingToken = await getPasswordResetTokenByToken(token.trim());

  console.log("existingToken result:", existingToken);
  
  if (!existingToken) {
    console.error("Token not found in database. Searched for:", token.trim());
    return { error: "Invalid token" };
  }

  const hasExpired = new Date() > existingToken.expires;

  if (hasExpired) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "404 Email not found" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
    },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated" };
};
