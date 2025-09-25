import {getVerificationTokenByEmail} from "@/data/verfication-token";
import {getPasswordResetTokenByEmail} from "@/data/password-reset-token";
import {db} from "@/lib/db";
import {getTwoFactorTokenByEmail} from "@/data/two-factor-token";

const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateTwoFactorToken = async (email: string) => {
  const token = generateSixDigitCode();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {id: existingToken.id},
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = generateSixDigitCode();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: {id: existingToken.id},
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
  const token = generateSixDigitCode();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {id: existingToken.id},
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};
