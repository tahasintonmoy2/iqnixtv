"use server";
import crypto from "crypto";

export const getSignature = async () => {
  const generateSignature = (secret: string, expire: string) => {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(expire);
    return hmac.digest("hex");
  };

  const expire = (Math.round(Date.now() / 1000) + 120).toString();
  const signature = generateSignature(
    process.env.UPLOADCARE_SECRET_KEY!,
    expire
  );

  return { expire, signature };
};
