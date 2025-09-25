import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify the user is requesting their own subscription data
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      // Return a default free subscription
      return NextResponse.json({
        id: "free",
        userId: userId,
        status: "ACTIVE",
        tier: "FREE",
        priceAmount: 0,
        currency: "USD",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        cancelAtPeriodEnd: false,
        cancelAt: null,
        canceledAt: null,
        polarSubscriptionId: `free_${userId}`,
        polarCustomerId: `free_${userId}`,
        productId: "free",
      });
    }

    return NextResponse.json(subscription);

  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
