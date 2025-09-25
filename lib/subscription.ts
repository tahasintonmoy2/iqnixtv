import { db } from "./db";
import { polar } from "./polar";
import { SubscriptionStatus, SubscriptionTier } from "@/lib/generated/prisma";

export class SubscriptionService {
  static async createSubscription(data: {
    userId: string;
    polarSubscriptionId: string;
    polarCustomerId: string;
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    priceAmount: number;
    currency: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }) {
    return db.subscription.create({
      data,
    });
  }

  static async updateSubscriptionStatus(
    polarSubscriptionId: string,
    status: SubscriptionStatus,
    currentPeriodEnd?: Date
  ) {
    const updateData: { status: SubscriptionStatus; currentPeriodEnd?: Date } =
      { status };
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = currentPeriodEnd;
    }

    return db.subscription.update({
      where: { polarSubscriptionId },
      data: updateData,
    });
  }

  static async getUserSubscription(userId: string) {
    return db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });
  }

  // Get user's current plan (including FREE for users without subscription)
  static async getUserPlan(userId: string): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription(userId);
    return subscription?.tier || "FREE";
  }

  // Check if user has a specific plan
  static async hasPlan(
    userId: string,
    plan: SubscriptionTier
  ): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    return userPlan === plan;
  }

  // Check if user has access to content based on tier hierarchy
  static async hasAccess(
    userId: string,
    requiredTier: SubscriptionTier
  ): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);

    const tierHierarchy = {
      FREE: 1,
      PREMIUM: 2,
      MAX: 3,
    };

    return tierHierarchy[userPlan] >= tierHierarchy[requiredTier];
  }

  // Check if user is on free plan
  static async isFreePlan(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return !subscription || subscription.tier === "FREE";
  }

  // Check if user is on premium plan
  static async isPremiumPlan(userId: string): Promise<boolean> {
    return this.hasPlan(userId, "PREMIUM");
  }

  // Check if user is on max plan
  static async isMaxPlan(userId: string): Promise<boolean> {
    return this.hasPlan(userId, "MAX");
  }

  // Get plan details with features and limitations
  static async getUserPlanDetails(userId: string) {
    const userPlan = await this.getUserPlan(userId);
    const subscription = await this.getUserSubscription(userId);

    const planDetails = {
      FREE: {
        name: "Free",
        tier: "FREE" as SubscriptionTier,
        features: ["Only Free Content", "SD Quality", "1 Device", "Ads"],
        limitations: {
          maxDevices: 1,
          quality: "SD",
          downloadLimit: 0,
          hasAds: true,
          contentAccess: "free",
        },
      },
      PREMIUM: {
        name: "Premium",
        tier: "PREMIUM" as SubscriptionTier,
        features: [
          "Most Content",
          "HD Quality",
          "2 Devices",
          "Downloads",
          "No Ads",
        ],
        limitations: {
          maxDevices: 2,
          quality: "HD",
          downloadLimit: 10,
          hasAds: false,
          contentAccess: "most",
        },
      },
      MAX: {
        name: "Max",
        tier: "MAX" as SubscriptionTier,
        features: [
          "All Content",
          "4K Quality",
          "Unlimited Devices",
          "Unlimited Downloads",
          "No Ads",
          "Early Access",
        ],
        limitations: {
          maxDevices: -1, // unlimited
          quality: "4K",
          downloadLimit: -1, // unlimited
          hasAds: false,
          contentAccess: "all",
        },
      },
    };

    return {
      ...planDetails[userPlan],
      subscription,
      isActive: !!subscription && subscription.status === "ACTIVE",
    };
  }

  static async cancelSubscription(userId: string) {
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    // Cancel in Polar
    await polar.cancelSubscription(subscription.polarSubscriptionId);

    // Update in database
    return db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        status: "CANCELED",
      },
    });
  }
}
