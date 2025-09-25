import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;
    if (!seasonId) {
      return NextResponse.json("Season id not found", { status: 404 });
    }

    const episode = await db.episode.findMany({
      where: {
        isPublished: true,
      },
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.log("[EPISODE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const user = await currentUser();
    const { seasonId } = await params;
    const { name } = await req.json();

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!name) {
      return NextResponse.json("Episode name not found", { status: 404 });
    }

    const seasonOwner = await db.season.findUnique({
      where: {
        id: seasonId,
      },
    });

    if (!seasonOwner) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const episode = await db.episode.create({
      data: {
        name,
        seasonId,
      },
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.log("[EPISODE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
