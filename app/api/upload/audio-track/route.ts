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
      "audio/m4a",
      "audio/wav",
      "audio/x-wav",
      "audio/mp3",
      ".m4a",
      ".wav",
      ".mp3",
    ];
    const isValidType =
      validTypes.some((type) => file.type.includes(type)) ||
      file.name.endsWith(".m4a") ||
      file.name.endsWith(".wav") ||
      file.name.endsWith(".mp3");

    if (!isValidType) {
      return new NextResponse(
        "Invalid file type. Only M4A, WAV and MP3 are allowed.",
        {
          status: 400,
        }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`audio-tracks/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[BLOB_UPLOAD_ERROR]", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
