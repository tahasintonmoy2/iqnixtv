import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ castId: string }> }
) {
  try {
    const { castId } = await params;
    // Get a single cast member by ID
    if (castId) {
      const cast = await db.cast.findUnique({
        where: { id: castId },
      });

      if (!cast) {
        return NextResponse.json(
          { error: "Cast member not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(cast);
    }

    // Get cast members by contentId
    if (castId) {
      const castMembers = await db.cast.findMany({
        where: { id: castId },
      });

      return NextResponse.json(castMembers);
    }

    const [castMembers] = await db.cast.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(castMembers);
  } catch (error) {
    console.error("Error fetching cast data:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ castId: string; seasonId: string }> }
) {
  try {
    const { castId, seasonId } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const {
      name,
      alsoKnownAs,
      image,
      dateOfBirth,
      gender,
      height,
      weight,
      age,
      region,
      career,
      bio,
      isFeatured,
    } = body;

    if (!castId) {
      return NextResponse.json(
        { error: "Cast ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !image || !gender || !age || !region || !career) {
      console.log("Missing required fields:", {
        name,
        image,
        gender,
        age,
        region,
        career,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, image, gender, age, region, career",
        },
        { status: 400 }
      );
    }

    const updateCast = await db.cast.update({
      where: {
        id: castId,
      },
      data: {
        name: String(name).trim(),
        alsoKnownAs: alsoKnownAs ? String(alsoKnownAs).trim() : null,
        image: String(image).trim(),
        dateOfBirth:
          dateOfBirth && dateOfBirth.trim() ? new Date(dateOfBirth) : null,
        gender: String(gender).trim(),
        height: height ? String(height).trim() : null,
        weight: weight ? String(weight).trim() : null,
        age: String(age).trim(), // Convert to string as per schema
        region: String(region).trim(),
        seasonId: String(seasonId).trim(), // Ensure seasonId is properly set
        isFeatured,
        career: Array.isArray(career)
          ? career.join(", ")
          : String(career).trim(),
        bio: bio ? String(bio).trim() : null,
      },
    });

    return NextResponse.json(updateCast);
  } catch (error) {
    console.log("[CAST_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { castId: string } }
) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!params.castId) {
      return NextResponse.json(
        { error: "Cast ID is required" },
        { status: 400 }
      );
    }

    // Check if the cast member exists
    const existingCast = await db.cast.findUnique({
      where: { id: params.castId },
    });

    if (!existingCast) {
      return NextResponse.json(
        { error: "Cast member not found" },
        { status: 404 }
      );
    }

    // Delete the cast member
    await db.cast.delete({
      where: { id: params.castId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cast member:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
