import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise< { seasonId: string }> }
) {
  try {
    const { seasonId } = await params;
    
    if (!seasonId) {
      // If no seasonId is provided, return all cast members
      const allCastMembers = await db.cast.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(allCastMembers);
    }

    console.log(seasonId);

    // Get all cast members for a specific season
    const castMembers = await db.cast.findMany({
      where: { seasonId },
    });

    if (!castMembers || castMembers.length === 0) {
      return NextResponse.json(
        { error: "No cast members found for this season" },
        { status: 404 }
      );
    }

    return NextResponse.json(castMembers);
  } catch (error) {
    console.error("Error fetching cast data:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

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
      isFeatured
    } = body;

    const { seasonId } = await params;
    console.log("Season ID from params:", seasonId);

    // Verify admin authentication
    const session = await auth();
    console.log("Session:", session);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate seasonId is provided and not empty
    if (!seasonId || seasonId.trim() === '') {
      return NextResponse.json(
        { error: "Season ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !image || !gender || !age || !region || !career) {
      console.log("Missing required fields:", { name, image, gender, age, region, career });
      return NextResponse.json(
        { error: "Missing required fields: name, image, gender, age, region, career" },
        { status: 400 }
      );
    }

    // Validate seasonId exists and is valid
    const season = await db.season.findUnique({
      where: { id: seasonId.trim() }
    });

    if (!season) {
      console.log("Season not found for ID:", seasonId);
      return NextResponse.json(
        { error: "Season not found" },
        { status: 404 }
      );
    }

    console.log("Season found:", season);

    const castData = {
      name: String(name).trim(),
      alsoKnownAs: alsoKnownAs ? String(alsoKnownAs).trim() : null,
      image: String(image).trim(),
      dateOfBirth: dateOfBirth && dateOfBirth.trim() ? new Date(dateOfBirth) : null,
      gender: String(gender).trim(),
      height: height ? String(height).trim() : null,
      weight: weight ? String(weight).trim() : null,
      age: String(age).trim(), // Convert to string as per schema
      region: String(region).trim(),
      seasonId: String(seasonId).trim(), // Ensure seasonId is properly set
      isFeatured,
      career: Array.isArray(career) ? career.join(", ") : String(career).trim(),
      bio: bio ? String(bio).trim() : null,
    };

    console.log("Creating cast member with data:", castData);

    // Create the cast member with explicit include to handle the relationship
    const newCast = await db.cast.create({
      data: castData,
      include: {
        season: true, // Include the season relationship
      },
    });

    console.log("Cast member created successfully:", newCast);

    return NextResponse.json(newCast, { status: 201 });
  } catch (error) {
    console.error("Error creating cast member:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      return NextResponse.json(
        { error: "Invalid season ID provided" },
        { status: 400 }
      );
    }
    
    // Check for Prisma validation errors
    if (error instanceof Error && error.message.includes('Inconsistent query result')) {
      return NextResponse.json(
        { error: "Database relationship error. Please ensure the season exists." },
        { status: 400 }
      );
    }
    
    // Return the actual error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error instanceof Error ? error.message : String(error)
      : "Something went wrong";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
