import { getTwoFactorComfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verfication-token";
import { db } from "@/lib/db";
import { sendTwoFactorToken, sendVerificationEmail } from "@/lib/resend-mail";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { LoginSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigin = "http://localhost:3001";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = LoginSchema.safeParse(body);

    if (!validatedFields.success) {
      console.log("Schema validation failed:", validatedFields.error);
      return NextResponse.json(
        { error: "Invalid credentials", details: validatedFields.error },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    const { email, password, code } = validatedFields.data;
    console.log("Attempting login for email:", email);
    
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
      console.log("User not found or missing required fields");
      return NextResponse.json(
        { error: "Email does not exist" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    console.log("User found, emailVerified:", existingUser.emailVerified);
    
    if (!existingUser.emailVerified) {
      console.log("Email not verified, code provided:", !!code);
      if (code) {
        const existingToken = await getVerificationTokenByToken(code);

        if (!existingToken) {
          return NextResponse.json(
            { error: "Invalid verification code" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        if (existingToken.email !== existingUser.email) {
          return NextResponse.json(
            { error: "Invalid verification code" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        const hasExpires = new Date(existingToken.expires) <= new Date();

        if (hasExpires) {
          return NextResponse.json(
            { error: "Verification code has expired" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        await db.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            emailVerified: new Date(),
          },
        });

        await db.verificationToken.delete({
          where: { id: existingToken.id },
        });

        const passwordsMatch = await bcrypt.compare(password, existingUser.password);
        
        if (!passwordsMatch) {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        return NextResponse.json(
          { success: "Login successful" },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": allowedOrigin,
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      } else {
        const verificationToken = await generateVerificationToken(
          existingUser.email
        );
        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token
        );

        return NextResponse.json(
          { success: "Confirmation email sent" },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": allowedOrigin,
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      }
    }

    console.log("Two-factor enabled:", existingUser.isTwoFactorEnabled);
    
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      console.log("Two-factor flow, code provided:", !!code);
      if (code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(
          existingUser.email
        );

        if (!twoFactorToken) {
          return NextResponse.json(
            { error: "Invalid code" }, 
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        if (twoFactorToken.token !== code) {
          return NextResponse.json(
            { error: "Two factor code is invalid" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date();

        if (hasExpired) {
          return NextResponse.json(
            { error: "Two factor code is expired" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        await db.twoFactorToken.delete({
          where: { id: twoFactorToken.id },
        });

        const existingConfirmation = await getTwoFactorComfirmationByUserId(
          existingUser.id
        );

        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id },
          });
        }

        await db.twoFactorConfirmation.create({
          data: {
            userId: existingUser.id,
          },
        });

        const passwordsMatch = await bcrypt.compare(password, existingUser.password);
        
        if (!passwordsMatch) {
          return NextResponse.json(
            { error: "Invalid credentials" },
            { 
              status: 400,
              headers: {
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Credentials": "true",
              },
            }
          );
        }

        return NextResponse.json(
          { success: "Login successful" },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": allowedOrigin,
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      } else {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email);
        await sendTwoFactorToken(twoFactorToken.email, twoFactorToken.token);
      }

      return NextResponse.json(
        { twoFactor: true }, 
        { 
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    console.log("Standard login flow - checking password");
    const passwordsMatch = await bcrypt.compare(password, existingUser.password);
    
    if (!passwordsMatch) {
      console.log("Password mismatch");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    return NextResponse.json(
      { success: "Login successful" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}
