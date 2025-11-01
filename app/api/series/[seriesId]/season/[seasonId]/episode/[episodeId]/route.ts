import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ seasonId: string; episodeId: string }> }
) {
  try {
    const { seasonId, episodeId } = await params;
    if (!seasonId) {
      return NextResponse.json("Season id not found", { status: 404 });
    }

    const episode = await db.episode.findMany({
      where: {
        id: episodeId,
        isPublished: true,
      },
    });

    return NextResponse.json(episode);
  } catch (error) {
    console.log("[EPISODE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      seasonId: string;
      episodeId: string;
      languageCode: string;
      url: string;
      name: string;
    }>;
  }
) {
  try {
    const { seasonId, episodeId, languageCode, url, name } = await params;
    const user = await currentUser();
    const { ...values } = await req.json();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const episode = await db.episode.update({
      where: {
        id: episodeId,
        seasonId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      try {
        console.log(`Creating Mux asset for videoUrl: ${values.videoUrl}`);

        const asset = await video.assets.create({
          inputs: [
            {
              url: values.videoUrl,
              language_code: "hi",
              type: "audio",
              name: "Hindi",
              generated_subtitles: [
                {
                  language_code: "en",
                  name: "English",
                },
              ],
            },
          ],
          video_quality: "premium",
          meta: {
            creator_id: user.id,
            title: values.name,
          },
          playback_policies: ["public"],
          max_resolution_tier: "2160p",
          test: false,
        });

        if (!asset.playback_ids || asset.playback_ids.length === 0) {
          throw new Error("No playback IDs returned from Mux");
        }

        const track = await video.assets.createTrack(asset.id, {
          language_code: languageCode,
          type: "text",
          url,
          name,
          text_type: "subtitles",
        });

        if (track.type !== "text" || track.text_type !== "subtitles") {
          throw new Error("Track type is not text");
        }

        // const muxData = await db.muxData.upsert({
        //   where: { episodeId },
        //   update: {
        //     assetId: asset.id,
        //     playbackId: asset.playback_ids[0].id
        //   },
        //   create: {
        //     episodeId,
        //     assetId: asset.id,
        //     playbackId: asset.playback_ids[0].id,
        //   },
        // });
      } catch (muxError) {
        console.error("Error creating Mux asset or saving MuxData:", muxError);
        throw muxError;
      }
    }

    return NextResponse.json(episode);
  } catch (error) {
    console.log("[SEASON_EPISODE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
