import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { POLAR_PRODUCTS } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    // Validate tier
    if (!tier || !POLAR_PRODUCTS[tier as keyof typeof POLAR_PRODUCTS]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // For free tier, just update the user's subscription status
    if (tier === "FREE") {
      // Check if user already has a subscription
      const existingSubscription = await db.subscription.findFirst({
        where: {
          userId: user.id!,
        },
      });

      if (existingSubscription) {
        // Update existing subscription
        await db.subscription.update({
          where: {
            id: existingSubscription.id,
          },
          data: {
            status: "ACTIVE",
            tier: "FREE",
            priceAmount: 0,
          },
        });
      } else {
        // Create new subscription
        await db.subscription.create({
          data: {
            userId: user.id!,
            status: "ACTIVE",
            tier: "FREE",
            priceAmount: 0,
            currency: "USD",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            cancelAtPeriodEnd: false,
            cancelAt: null,
            canceledAt: null,
            // Polar specific fields
            polarSubscriptionId: `free_${user.id}_${Date.now()}`,
            polarCustomerId: `free_${user.id}`,
            productId: "free",
          },
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Free subscription activated" 
      });
    }

    // For paid tiers, create a checkout session with Polar
    // You'll need to implement this based on your Polar product setup
    // This is a placeholder - you'll need to replace with actual Polar API calls
    
    // Example of what you might do:
    // 1. Create a customer in Polar if they don't exist
    // 2. Create a checkout session for the specific product
    // 3. Return the checkout URL
    
    // For now, we'll return a placeholder response
    // You'll need to implement the actual Polar checkout logic
    
    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${tier}?userId=${user.id}`;
    
    return NextResponse.json({
      url: checkoutUrl,
      success: true,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
