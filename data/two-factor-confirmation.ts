import { db } from "@/lib/db";

export const getTwoFactorComfirmationByUserId = async (userId: string) => {
  try {
    const twoFactorComfirmation = await db.twoFactoConfirmation.findUnique({
      where: {
        userId,
      },
    });

    return twoFactorComfirmation;
  } catch (error) {
    console.log(error);
    return null;
  }
};
