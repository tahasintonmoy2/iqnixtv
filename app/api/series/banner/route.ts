import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
) {
    try {
        const user = await currentUser();
        const { name } = await req.json();

        if (!user?.id) {
            return NextResponse.json("Unauthorized", { status: 401 });
        }

        if (!name) {
            return NextResponse.json("Series banner name not found", { status: 404 });
        }

        const series = await db.seriesBanner.create({
            data: {
                name,
            },
        });

        return NextResponse.json(series);
    } catch (error) {
        console.log("[SERIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}