import { LoginCodeEmail } from "@/components/emails/login-code-email";
import { ResetPasswordCodeEmail } from "@/components/emails/reset-code-email";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { TwoFactorConfirmationCodeEmail } from "@/components/emails/two-factor-code-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorToken = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `${token} - Your IqnixTV 2FA code`,
    react: TwoFactorConfirmationCodeEmail({ validationCode: token }),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `${token} - Your IqnixTV login code`,
    react: LoginCodeEmail({ validationCode: token }),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  userId: string
) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: `${token} - Your IqnixTV password reset code`,
    react: ResetPasswordCodeEmail({
      validationCode: token,
      userFirstName: user?.firstName ?? "Dear user",
    }),
  });
};
