import {getVerificationTokenByToken} from "@/data/verfication-token";
import {getUserByEmail} from "@/data/user";
import {db} from "@/lib/db";

export const emailVerification = async (email: string, code: string) => {
  if (!email || !code) {
    return { error: "Email and code are required" }
  }

  const existingToken = await getVerificationTokenByToken(code);

  if (!existingToken){
    return { error: "Invalid verification code" }
  }

  if (existingToken.email !== email) {
    return { error: "Invalid verification code" }
  }

  const hasExpired = new Date(existingToken.expires) <= new Date();

  if (hasExpired){
    return { error: "Verification code has expired" }
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found" }
  }

  await db.user.update({
    where: {
      id: existingUser.id
    },
    data: {
      emailVerified: new Date(),
    }
  });

  await db.verificationToken.delete({
    where: {
      id: existingToken.id
    }
  });

  return { success: "Email verified successfully! You can now sign in." }
}
