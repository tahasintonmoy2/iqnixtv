import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET!;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization bearer token is required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer", "").trim();
    localStorage.setItem("auth-token", token);

    if (!token || token.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 400 }
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId =
      typeof decodedToken === "object" && "id" in decodedToken
        ? decodedToken.id
        : null;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(user), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    return NextResponse.json("Internal server error", { status: 500 });
  }
}
