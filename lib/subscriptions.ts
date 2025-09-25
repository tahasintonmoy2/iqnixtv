import { currentUser } from "./auth";
import { db } from "./db";

export const getUserSubscription = async (userId: string) => {
  return await db.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],
      },
      currentPeriodEnd: {
        gt: new Date(),
      },
    },
    orderBy: {
      currentPeriodEnd: "desc",
    },
  });
};

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return false;
  }

  const subscription = await db.subscription.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      polarSubscriptionId: true,
      currentPeriodEnd: true,
      polarCustomerId: true,
      productId: true,
    },
  });

  if (!subscription) {
    return false;
  }

  const isValid =
    subscription.productId &&
    subscription.currentPeriodEnd?.getTime() + DAY_IN_MS > Date.now();

  return !!isValid;
};
