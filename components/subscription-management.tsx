"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { POLAR_PRODUCTS, SubscriptionTier } from "@/lib/polar";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubscriptionManagementProps {
  currentTier?: SubscriptionTier;
  isActive?: boolean;
}

export function SubscriptionManagement({ currentTier = "FREE", isActive = false }: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useAuth();
  const router = useRouter();

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/sign-in");
      return;
    }

    if (tier === "FREE") return;

    setIsLoading(true);
    try {
      // Create checkout session with Polar
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          userId: user.id,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/profile?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Polar checkout
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || currentTier === "FREE") return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error("Cancel subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case "FREE":
        return <Zap className="h-5 w-5" />;
      case "PREMIUM":
        return <Star className="h-5 w-5" />;
      case "MAX":
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case "FREE":
        return "bg-gray-100 text-gray-800";
      case "PREMIUM":
        return "bg-blue-100 text-blue-800";
      case "MAX":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your streaming needs
        </p>
      </div>

      {/* Current Plan Status */}
      {isActive && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTierIcon(currentTier)}
              Current Plan: {POLAR_PRODUCTS[currentTier].name}
            </CardTitle>
            <CardDescription>
              You are currently on the {POLAR_PRODUCTS[currentTier].name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className={getTierColor(currentTier)}>
              Active
            </Badge>
            {currentTier !== "FREE" && (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="mt-4"
              >
                {isLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(POLAR_PRODUCTS).map(([tier, plan]) => (
          <Card
            key={tier}
            className={`relative ${
              currentTier === tier && isActive
                ? "border-2 border-primary shadow-lg"
                : "border"
            }`}
          >
            {currentTier === tier && isActive && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Current Plan
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(tier as SubscriptionTier)}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-3xl font-bold">
                {plan.price === 0 ? (
                  "Free"
                ) : (
                  <>
                    ${(plan.price / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                variant={currentTier === tier ? "outline" : "default"}
                disabled={
                  isLoading || 
                  (currentTier === tier && isActive) ||
                  tier === "FREE"
                }
                onClick={() => handleSubscribe(tier as SubscriptionTier)}
              >
                {isLoading
                  ? "Processing..."
                  : currentTier === tier && isActive
                  ? "Current Plan"
                  : tier === "FREE"
                  ? "Free Forever"
                  : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
