import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    // Verify the user is canceling their own subscription
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Update the subscription to cancel at period end
    await db.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelAtPeriodEnd: true,
        cancelAt: new Date(),
      },
    });

    // If you have Polar API integration, you would also cancel the subscription there
    // For now, we'll just update the local database
    
    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the current period",
    });

  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
