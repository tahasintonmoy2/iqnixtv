import { db } from "@/lib/db";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = db.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    return passwordResetToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passowrdResetToken = db.passwordResetToken.findFirst({
      where: {
        email,
      },
    });

    return passowrdResetToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};
