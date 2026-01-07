import { checkSubscription } from "@/lib/subscriptions";
import React from "react";
import SubscriptionButton from "./subscription-button";

export const ClientSubscriptionButton = async () => {
  const isPro = await checkSubscription();

  return (
    <div>
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};
