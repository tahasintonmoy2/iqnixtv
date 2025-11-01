import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ playbackId: string }> }
) {
  try {
    const { playbackId } = await params;

    if (!playbackId) {
      return NextResponse.json("Playback id not found", { status: 404 });
    }

    const response = await fetch(
      `https://api.mux.com/video/v1/playback-ids/${playbackId}`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`)}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch manifest" },
        { status: response.status }
      );
    }

    const playbackData = await response.json();
    const assetId = playbackData.data.object.id;

    const trackRes = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`)}`,
        },
      }
    );
    const { data } = await trackRes.json();

    const tracks = Array.isArray(data) ? data : [];

    const subtitles = tracks
      .filter((t) => t.type === "text" && t.text_type === "subtitles")
      .map((t) => ({
        id: t.id,
        label: t.name,
        lang: t.language_code,
        src: t.url,
      }));

    return NextResponse.json({ subtitles });
  } catch (error) {
    console.log("[SERIES_POST]", error);
    return new NextResponse(`Internal Error, ${error}`, { status: 500 });
  }
}
