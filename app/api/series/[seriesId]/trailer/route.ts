import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
) {
  try {
    const user = await currentUser();
    const { name } = await req.json();

    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!name) {
      return NextResponse.json("Trailer name is required", { status: 400 });
    }

    const trailers = await db.trailers.create({
      data: {
        name,
      },
    });

    return NextResponse.json(trailers);
  } catch (error) {
    console.log("[SERIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}