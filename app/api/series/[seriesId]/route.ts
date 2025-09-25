import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// const { video } = new Mux({
//   tokenId: process.env.MUX_TOKEN_ID!,
//   tokenSecret: process.env.MUX_TOKEN_SECRET!,
// });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const user = await currentUser();
    const { genreId, contentLanguageId, isOrginalLanguage, ...values } =
      await req.json();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updateData = { ...values };

    if (genreId && Array.isArray(genreId)) {
      const episode = await db.series.update({
        where: {
          id: seriesId,
        },
        data: {
          ...updateData,
          genreId: Array.isArray(genreId)
            ? genreId.join(", ")
            : String(genreId).trim(),
        },
      });

      return NextResponse.json(episode);
    } else if (contentLanguageId && Array.isArray(contentLanguageId)) {
      const episode = await db.series.update({
        where: {
          id: seriesId,
        },
        data: {
          ...updateData,
          contentLanguageId: Array.isArray(contentLanguageId)
            ? contentLanguageId.join(", ")
            : String(contentLanguageId).trim(),
        },
      });

      if (typeof isOrginalLanguage === "boolean") {
        const ids = Array.isArray(contentLanguageId)
          ? contentLanguageId.map((id: string) => String(id).trim()).filter(Boolean)
          : [String(contentLanguageId).trim()].filter(Boolean);

        if (ids.length > 0) {
          await db.contentLanguage.updateMany({
            where: { id: { in: ids } },
            data: { isOrginalLanguage },
          });
        }
      }

      return NextResponse.json(episode);
    } else {
      const episode = await db.series.update({
        where: {
          id: seriesId,
        },
        data: {
          ...updateData,
        },
      });

      return NextResponse.json(episode);
    }

    // if (values.videoUrl) {
    //   const asset = await video.assets.create({
    //     inputs: [
    //       {
    //         url: values.videoUrl,
    //         generated_subtitles: [
    //           {
    //             language_code: "en",
    //             name: "English",
    //           },
    //         ],
    //       },
    //     ],
    //     playback_policies: ["public"],
    //     max_resolution_tier: "2160p",
    //     test: false,
    //   });
    //
    //     await db.muxData.upsert({
    //       where: { episodeId },
    //       update: {
    //         assetId: asset.id,
    //         playbackId: asset.playback_ids?.[0].id
    //       },
    //       create: {
    //         episodeId,
    //         assetId: asset.id,
    //         playbackId: asset.playback_ids?.[0]?.id,
    //       },
    //     });
    // }
  } catch (error) {
    console.log("[SERIES_EPISODE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
