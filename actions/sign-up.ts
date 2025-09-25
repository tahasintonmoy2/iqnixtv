"use server";
import {db} from "@/lib/db";
import {sendVerificationEmail} from "@/lib/resend-mail";
import {generateVerificationToken} from "@/lib/tokens";
import {SignUpSchema} from "@/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const signup = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return {error: "Invalid credentials"};
  }

  const {email, firstName, lastName, password} = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await db.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    return {error: "Oops this email already in use"};
  }

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return {success: `Confirmation email sent to ${email}`};
};
