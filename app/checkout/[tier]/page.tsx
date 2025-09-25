"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { POLAR_PRODUCTS, SubscriptionTier } from "@/lib/polar";
import axios from "axios";
import { ArrowLeft, Check, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const params = useParams();
  const tier = params.tier as SubscriptionTier;
  const user = useUser();
  const userId = user?.id
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = POLAR_PRODUCTS[tier];

  useEffect(() => {
    // Redirect if user is not authenticated or tier is invalid
    if (!user || !plan || !user.id) {
      window.location.href = "/auth/sign-in";
      return;
    }
  }, [user, plan]);

  const handleCheckout = async () => {
    if (!user || !plan || !user.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/checkout", {
        tier,
        userId,
        successUrl: `${window.location.origin}/profile?success=true`,
        cancelUrl: `${window.location.origin}/profile?canceled=true`,
      });

      if (response.status !== 200) {
        return toast.error("Failed to create checkout session");
      }

      const { url } = await response.data;
      
      // Redirect to Polar checkout
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Invalid subscription tier
            </p>
            <Link href="/profile" className="block text-center mt-4 text-primary hover:underline">
              Back to Profile
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Plan Details</CardTitle>
              <CardDescription>
                Review your selected plan before checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="text-4xl font-bold mt-4">
                  {plan.price === 0 ? (
                    "Free"
                  ) : (
                    <>
                      ${(plan.price / 100).toFixed(2)}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">What&apos;s included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                You&apos;ll be redirected to our secure payment processor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{user?.firstName} {user?.lastName}</span>
                  </div>
                </div>
              </div>

              {/* Plan Summary */}
              <div className="space-y-3">
                <h4 className="font-semibold">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing Cycle:</span>
                    <span>Monthly</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span>
                      {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  By clicking &quot;Subscribe&quot;, you agree to our Terms of Service and Privacy Policy. 
                  Your subscription will automatically renew each month unless canceled.
                </p>
                <p>
                  You can cancel your subscription at any time from your account settings.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>

              {/* Security Notice */}
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                    <Lock className="mr-2 size-4"/>
                 Secure Payment Processing
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
