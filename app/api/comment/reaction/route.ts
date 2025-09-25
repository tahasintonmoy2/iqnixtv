import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { commentId } = body;

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!commentId) {
      return NextResponse.json("Comment is required");
    }

    const existingReaction = await db.like.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: commentId,
        },
      },
    });

    if (existingReaction) {
      await db.like.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return NextResponse.json({
        message: "Reaction removed",
        action: "removed",
      });
    } else {
      const newReaction = await db.like.create({
        data: {
          userId: user.id,
          commentId,
        },
      });

      return NextResponse.json({
        message: "Reaction added",
        action: "added",
        reaction: newReaction,
      });
    }
  } catch (error) {
    console.log("[COMMENT_REACTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const body = await req.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const reactions = await db.like.findMany({
      where: { commentId },
      include: {
        user: true,
      },
    });

    const reactionCounts = await db.like.groupBy({
      by: ["commentId"],
      where: { commentId },
      _count: true,
    });

    return NextResponse.json({
      reactions,
      counts: reactionCounts,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
