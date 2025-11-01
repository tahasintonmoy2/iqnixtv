import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { name } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const forum = await db.forum.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(forum);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}