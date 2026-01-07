import { currentUser } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await currentUser();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Validate file type (SRT or VTT)
    const validTypes = [
      "text/vtt",
      "text/plain",
      "application/x-subrip",
      ".srt",
      ".vtt",
    ];
    const isValidType =
      validTypes.some((type) => file.type.includes(type)) ||
      file.name.endsWith(".srt") ||
      file.name.endsWith(".vtt");

    if (!isValidType) {
      return new NextResponse(
        "Invalid file type. Only SRT and VTT are allowed.",
        {
          status: 400,
        }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`subtitles/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[BLOB_UPLOAD_ERROR]", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
