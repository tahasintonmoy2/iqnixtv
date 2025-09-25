// Product configuration - map your Polar products to subscription tiers
// IMPORTANT: Set the following env vars to your actual Polar UUIDs
// NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID, NEXT_PUBLIC_POLAR_PREMIUM_PRICE_ID
// NEXT_PUBLIC_POLAR_MAX_PRODUCT_ID, NEXT_PUBLIC_POLAR_MAX_PRICE_ID
export const POLAR_PRODUCTS = {
  FREE: {
    key: "free",
    name: "Free",
    description: "Basic access to content",
    price: 0,
    features: ["Basic content access", "Standard quality"],
  },
  PREMIUM: {
    key: "premium",
    name: "Premium",
    description: "Premium content and features",
    price: 999, // $9.99 in cents
    features: ["Premium content", "HD quality", "Ad-free experience"],
    productId: process.env.NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID || "",
    priceId: process.env.NEXT_PUBLIC_POLAR_PREMIUM_PRICE_ID || "",
  },
  MAX: {
    key: "max",
    name: "Max",
    description: "Ultimate streaming experience",
    price: 1999, // $19.99 in cents
    features: ["All content", "4K quality", "Ad-free experience", "Offline downloads"],
    productId: process.env.NEXT_PUBLIC_POLAR_MAX_PRODUCT_ID || "",
    priceId: process.env.NEXT_PUBLIC_POLAR_MAX_PRICE_ID || "",
  },
} as const;

export type SubscriptionTier = keyof typeof POLAR_PRODUCTS;

// Helper function to get product by Polar product UUID or price UUID
export function getProductById(productId: string) {
  return Object.values(POLAR_PRODUCTS).find(
    // @ts-expect-error runtime guard for optional fields
    (product) => product.productId === productId || product.priceId === productId
  );
}

// Helper function to get tier by Polar product/price ID
export function getTierByProductId(productId: string): SubscriptionTier {
  if (
    productId === POLAR_PRODUCTS.PREMIUM.productId ||
    productId === POLAR_PRODUCTS.PREMIUM.priceId
  ) {
    return "PREMIUM";
  }
  if (
    productId === POLAR_PRODUCTS.MAX.productId ||
    productId === POLAR_PRODUCTS.MAX.priceId
  ) {
    return "MAX";
  }
  return "FREE";
}
