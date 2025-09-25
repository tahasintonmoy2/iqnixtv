import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { commentId, content } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!commentId || !content) {
      return NextResponse.json("Comment ID and content are required", {
        status: 400,
      });
    }

    const reply = await db.reply.create({
      data: {
        userId: user.id,
        content,
        commentId
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[COMMENT_REPLY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { content, replyId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!replyId || !content) {
      return NextResponse.json("Reply ID and content are required", {
        status: 400,
      });
    }

    const existingReply = await db.reply.findFirst({
      where: {
        id: replyId,
        userId: user.id,
      },
    });

    if (!existingReply) {
      return NextResponse.json("Reply not found or unauthorized", {
        status: 404,
      });
    }

    const updatedReply = await db.reply.update({
      where: {
        id: replyId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error("[REPLY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { replyId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!replyId) {
      return NextResponse.json("Comment ID and content are required", {
        status: 400,
      });
    }

    const existingReply = await db.reply.findFirst({
      where: {
        id: replyId,
        userId: user.id,
      },
    });

    if (!existingReply) {
      return NextResponse.json("Reply not found or unauthorized", {
        status: 404,
      });
    }

    const reply = await db.reply.delete({
      where: {
        id: replyId,
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[REPLY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}