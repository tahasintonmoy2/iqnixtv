import { db } from "@/lib/db";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    if (!token || token.trim() === "") {
      console.log("Token is empty or null");
      return null;
    }

    // Decode the token in case it comes URL encoded
    const decodedToken = decodeURIComponent(token.trim());
    console.log("Original token:", token.trim());
    console.log("Decoded token:", decodedToken);
    
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: {
        token: decodedToken,
      },
    });

    if (!passwordResetToken) {
      console.log("Token not found in database for token:", decodedToken);
    } else {
      console.log("Token found in database");
    }

    return passwordResetToken;
  } catch (error) {
    console.error("Error fetching password reset token:", error);
    console.error("Token being searched:", token);
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    if (!email || email.trim() === "") {
      return null;
    }

    const passowrdResetToken = await db.passwordResetToken.findFirst({
      where: {
        email: email.trim(),
      },
    });

    return passowrdResetToken;
  } catch (error) {
    console.error("Error fetching password reset token by email:", error);
    return null;
  }
};
