import { sanitizeVTTContent } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json("URL query parameter is required", {
        status: 400,
      });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch VTT: ${response.statusText}` },
        { status: response.status }
      );
    }

    let content = await response.text();

    content = sanitizeVTTContent(content);

    if (!content.startsWith("WEBVTT")) {
      return NextResponse.json("Invalid WEBVTT File", { status: 400 });
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("VTT proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy VTT file" },
      { status: 500 }
    );
  }
}
