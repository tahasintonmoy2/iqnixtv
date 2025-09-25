"use server";

import {signIn} from "@/auth";
import {getTwoFactorComfirmationByUserId} from "@/data/two-factor-confirmation";
import {getTwoFactorTokenByEmail} from "@/data/two-factor-token";
import {getUserByEmail} from "@/data/user";
import {db} from "@/lib/db";
import {sendTwoFactorToken, sendVerificationEmail} from "@/lib/resend-mail";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import {DEFALUT_LOGIN_REDIRECT} from "@/routes";
import {LoginSchema} from "@/schemas";
import {AuthError} from "next-auth";
import * as z from "zod";
import {getVerificationTokenByToken} from "@/data/verfication-token";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {error: "Invalid credentials"};
  }

  const {email, password, code} = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {error: "Email does not exist"};
  }

  if (!existingUser.emailVerified) {
    if (code) {
      const existingToken = await getVerificationTokenByToken(code)

      if (!existingToken) {
        return {error: "Invalid verification code"}
      }

      if (existingToken.email !== existingUser.email) {
        return {error: "Invalid verification code"}
      }

      const hasExpires = new Date(existingToken.expires) <= new Date();

      if (hasExpires) {
        return {error: "Verification code has expired"}
      }

      await db.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          emailVerified: new Date()
        }
      });

      await db.verificationToken.delete({
        where: {id: existingToken.id}
      });

      try {
        await signIn("credentials", {
          email,
          password,
          redirectTo: DEFALUT_LOGIN_REDIRECT,
        });
      } catch (error) {
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              return {error: "Invalid credentials"};
            default:
              return {error: "Something went wrong"};
          }
        }
        throw error;
      }
    } else {
      const verificationToken = await generateVerificationToken(
        existingUser.email
      );
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      return {success: "Confirmation email sent"};
    }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return {error: "Invalid code"};
      }

      if (twoFactorToken.token !== code) {
        return {error: "Two factor code is invalid"};
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return {error: "Two factor code is expired"};
      }

      await db.twoFactorToken.delete({
        where: {id: twoFactorToken.id},
      });

      const existingConfirmation = await getTwoFactorComfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: {id: existingConfirmation.id},
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorToken(twoFactorToken.email, twoFactorToken.token);
    }

    return {twoFactor: true};
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFALUT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {error: "Invalid credentials"};
        default:
          return {error: "Something went wrong"};
      }
    }

    throw error;
  }
};
