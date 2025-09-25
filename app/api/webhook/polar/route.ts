import { db } from "@/lib/db";
import { getTierByProductId } from "@/lib/polar";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("POLAR WEBHOOK", payload.type);
  },
  onSubscriptionCreated: async ({ data }) => {
    const sub = data;

    const userId = sub.customer?.externalId;
    if (sub.customer && userId) {
      try {
        // First create/update the customer
        await db.customer.upsert({
          where: {
            polarCustomerId: sub.customer.id,
          },
          create: {
            polarCustomerId: sub.customer.id,
            userId,
          },
          update: {
            userId,
          },
        });

        // Determine the subscription tier based on the product ID
        const tier = getTierByProductId(sub.product.id);

        // Get price amount - this may need to be adjusted based on your Polar setup
        // You might need to fetch this from a separate API call or store it differently
        const priceAmount = 0; // Default to 0, update based on your product configuration

        // Then create/update the subscription
        await db.subscription.upsert({
          where: {
            polarSubscriptionId: sub.id,
          },
          create: {
            polarSubscriptionId: sub.id,
            userId: sub.customer.externalId ?? "",
            status: sub.status,
            currentPeriodStart: new Date(sub.currentPeriodStart),
            currentPeriodEnd: new Date(sub.currentPeriodEnd ?? ""),
            productId: sub.product.id,
            canceledAt: sub.canceledAt,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            // Add missing required fields with proper mapping
            polarCustomerId: sub.customer.id,
            priceAmount: priceAmount,
            tier: tier,
            currency: "USD", // Default currency
            cancelAt: null,
          },
          update: {
            status: sub.status,
            currentPeriodStart: new Date(sub.currentPeriodStart),
            currentPeriodEnd: new Date(sub.currentPeriodEnd ?? ""),
            canceledAt: sub.canceledAt,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            cancelAt: null,
            tier: tier,
            priceAmount: priceAmount,
          },
        });

        console.log(
          `Subscription created/updated for user ${userId} with tier ${tier}`
        );
      } catch (error) {
        console.error("Error processing subscription webhook:", error);
        throw error; // Re-throw to let Polar know the webhook failed
      }
    }
  },
  onSubscriptionUpdated: async ({ data }) => {
    const sub = data;

    const userId = sub.customer?.externalId;
    if (sub.customer && userId) {
      try {
        const tier = getTierByProductId(sub.product.id);
        const priceAmount = 0; // Default to 0, update based on your product configuration

        await db.subscription.updateMany({
          where: {
            polarSubscriptionId: sub.id,
          },
          data: {
            status: sub.status,
            currentPeriodStart: new Date(sub.currentPeriodStart),
            currentPeriodEnd: new Date(sub.currentPeriodEnd ?? ""),
            canceledAt: sub.canceledAt,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            cancelAt: null,
            tier: tier,
            priceAmount: priceAmount,
          },
        });

        console.log(
          `Subscription updated for user ${userId} with tier ${tier}`
        );
      } catch (error) {
        console.error("Error processing subscription update webhook:", error);
        throw error;
      }
    }
  },
  onSubscriptionCanceled: async ({ data }) => {
    const sub = data;

    if (sub.id) {
      try {
        await db.subscription.updateMany({
          where: {
            polarSubscriptionId: sub.id,
          },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
            cancelAtPeriodEnd: true,
          },
        });

        console.log(`Subscription canceled: ${sub.id}`);
      } catch (error) {
        console.error("Error processing subscription cancel webhook:", error);
        throw error;
      }
    }
  },
});
