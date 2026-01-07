"use client";

import { useAuth } from "@/contexts/auth-context";
import { POLAR_PRODUCTS } from "@/lib/polar";
import Link from "next/link";
import { Button } from "./ui/button";

interface SubscriptionButtonProps {
  isPro: boolean;
}

export default function SubscriptionButton({ isPro }: SubscriptionButtonProps) {
  const {user} = useAuth();

  if (!user?.id) {
    // User is not logged in, don't render the button
    return null;
  }

  if (!isPro) {
    // User has no active subscription → Subscribe button
    const productPriceId = POLAR_PRODUCTS.PREMIUM.priceId;
    const productId = POLAR_PRODUCTS.PREMIUM.productId;

    const params = new URLSearchParams();
    // Polar Checkout GET expects `products` query param containing a UUID
    if (productPriceId) {
      params.set("products", productPriceId);
    } else if (productId) {
      params.set("products", productId);
    }
    if (user?.email) params.set("customer_email", user.email);
    if (user?.id) params.set("externalId", user.id);
    // Optional metadata if you still want it
    params.set("metadata", JSON.stringify({ userId: user?.id }));

    return (
      <Link href={`/checkout?${params.toString()}`}>
        <Button>Join Premium</Button>
      </Link>
    );
  }

  if (isPro) {
    // User has an active subscription → Manage button
    return (
      <Link href="/portal">
        <Button variant="outline">Manage Subscription</Button>
      </Link>
    );
  }
}
