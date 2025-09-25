import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { content, episodeId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!episodeId) {
      return NextResponse.json("Episode ID is required", { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        content,
        episodeId,
        userId: user.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { content, commentId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!commentId || !content) {
      return NextResponse.json("Comment ID and content are required", {
        status: 400,
      });
    }

    const existingComment = await db.comment.findFirst({
      where: {
        id: commentId,
        userId: user.id,
      },
    });

    if (!existingComment) {
      return NextResponse.json("Comment not found or unauthorized", {
        status: 404,
      });
    }

    const updatedComment = await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("[COMMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { commentId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!commentId) {
      return NextResponse.json("Comment ID and content are required", {
        status: 400,
      });
    }

    const existingComment = await db.comment.findFirst({
      where: {
        id: commentId,
        userId: user.id,
      },
    });

    if (!existingComment) {
      return NextResponse.json("Comment not found or unauthorized", {
        status: 404,
      });
    }

    const comment = await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  params: Promise<{ episodeId: string }>
) {
  try {
    const { episodeId } = await params;

    if (!episodeId) {
      return NextResponse.json("Episode ID is required", { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: {
        episodeId,
      },
      include: {
        replies: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[EPISODE_COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
