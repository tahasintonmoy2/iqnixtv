import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/resend-mail";
import { generateVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, firstName, lastName, password } = body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Oops this email already in use" },
        { status: 400 }
      );
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
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return (
      NextResponse.json({ success: "Sign up successful" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
