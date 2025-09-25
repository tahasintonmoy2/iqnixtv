import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all available cast members
    const allCastMembers = await db.cast.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(allCastMembers);
  } catch (error) {
    console.error("Error fetching cast data:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 