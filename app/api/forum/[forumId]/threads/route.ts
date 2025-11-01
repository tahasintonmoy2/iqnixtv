import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ forumId: string }> }
) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { content, title, tags } = body;
    const { forumId } = await params;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const thread = await db.thread.create({
      data: {
        title,
        content,
        forumId,
        tags: {
          createMany: {
            data: [
              ...tags.map((tag: {name: string})=> tag)
            ]
          }
        },
        userId: user.id,
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}