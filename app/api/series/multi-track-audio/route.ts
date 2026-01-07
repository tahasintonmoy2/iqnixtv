import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface MuxAudioTrack {
  id: string;
  type: string;
  language_code?: string | null;
  name?: string | null;
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user?.id || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, languageCode, url, episodeId } = body;

    if (!name || !languageCode || !url) {
      return NextResponse.json(
        { error: "Missing required fields: name, fileUrl, languageCode" },
        { status: 400 }
      );
    }

    const muxAsset = await db.muxData.findUnique({
      where: { episodeId },
    });

    if (!muxAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const track = await video.assets.createTrack(muxAsset.assetId, {
      language_code: languageCode,
      type: "audio",
      name,
      url,
    });

    if (!track.id) {
      return NextResponse.json("Track id not found", { status: 404 });
    }

    const audioTrack = await db.audioTrack.create({
      data: {
        muxTrackId: track.id,
        url,
        episodeId,
        languageCode,
        muxDataId: muxAsset.id,
        name,
        status: track.status || "ready",
        type: "alternate",
      },
    });

    return NextResponse.json(audioTrack);
  } catch (error) {
    console.error("[PLAYLISTS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json(
        { error: "episodeId parameter is required" },
        { status: 400 }
      );
    }

    const muxAsset = await db.muxData.findUnique({
      where: { episodeId },
    });

    if (!muxAsset?.assetId) {
      return NextResponse.json(
        { error: "Mux asset not found" },
        { status: 404 }
      );
    }

    // 1️ Always fetch DB tracks first (safe fallback)
    const dbTracks = await db.audioTrack.findMany({
      where: { episodeId },
      orderBy: { createdAt: "asc" },
    });

    // 2️ Fetch asset status
    const asset = await video.assets.retrieve(muxAsset.assetId);

    let muxTracks: MuxAudioTrack[] = [];

    // 3️ ONLY fetch tracks if asset is ready
    if (asset.status === "ready") {
      try {
        // Tracks are included in the asset object
        const tracks = asset.tracks || [];

        muxTracks = tracks.filter((t) => t.type === "audio") as MuxAudioTrack[];
      } catch (e) {
        console.warn("Mux tracks unavailable:", e);
      }
    }

    // 4️ Normalize DB tracks
    const formattedDbTracks = dbTracks.map((t) => ({
      id: t.muxTrackId || t.id,
      type: t.type,
      languageCode: t.languageCode,
      name: t.name,
      source: "db",
    }));

    // 5️ Remove duplicates (prefer DB)
    const uniqueMuxTracks = muxTracks
      .filter((mt) => !dbTracks.some((dbt) => dbt.muxTrackId === mt.id))
      .map((t) => ({
        id: t.id,
        type: "audio",
        languageCode: t.language_code ?? "",
        name: t.name ?? null,
        source: "mux",
      }));

    return NextResponse.json({
      tracks: [...uniqueMuxTracks, ...formattedDbTracks],
    });
  } catch (error) {
    console.error("Fetch tracks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}
