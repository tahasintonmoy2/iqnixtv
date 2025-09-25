"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Check,
  Crown,
  Download,
  HdmiPortIcon as Hd,
  Headphones,
  Shield,
  Smartphone,
  Star,
  Tv,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import { useState } from "react";

const pricingPlans = {
  monthly: [
    {
      id: "basic",
      name: "Free",
      price: 0,
      description: "Perfect for casual viewers",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
      features: [
        { text: "1 device at a time", icon: Smartphone },
        { text: "HD quality (720p)", icon: Hd },
        { text: "Standard audio", icon: Volume2 },
        { text: "Mobile & tablet access", icon: Smartphone },
        { text: "Basic customer support", icon: Headphones },
      ],
      limitations: [
        "No offline downloads",
        "Limited to mobile devices",
        "Ads included",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 4.99,
      description: "Great for families",
      icon: Tv,
      color: "from-purple-500 to-pink-500",
      popular: true,
      features: [
        { text: "2 devices simultaneously", icon: Users },
        { text: "Full HD quality (1080p)", icon: Hd },
        { text: "Enhanced audio", icon: Volume2 },
        { text: "All devices supported", icon: Tv },
        { text: "Limited downloads (10)", icon: Download },
        { text: "Priority support", icon: Headphones },
      ],
      limitations: ["Limited downloads", "Some ads on free content"],
    },
    {
      id: "max",
      name: "Max",
      price: 19.99,
      description: "Ultimate entertainment experience",
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      features: [
        { text: "4 devices simultaneously", icon: Users },
        { text: "4K Ultra HD + HDR", icon: Hd },
        { text: "Dolby Atmos audio", icon: Volume2 },
        { text: "All devices + Smart TV", icon: Tv },
        { text: "Unlimited downloads", icon: Download },
        { text: "24/7 premium support", icon: Headphones },
        { text: "Early access to content", icon: Star },
        { text: "Ad-free experience", icon: Shield },
      ],
      limitations: [],
    },
  ],
};

export function PricingTiers() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlans = pricingPlans.monthly;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would typically redirect to checkout or open a signup modal
    console.log(`Selected plan: ${planId}`);
  };

  return (
    <div className="space-y-8">
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {currentPlans.map((plan) => {
          const IconComponent = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-2xl",
                plan.popular
                  ? "ring-2 ring-primary shadow-xl scale-105"
                  : isSelected
                    ? "ring-2 ring-green-500"
                    : ""
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div
                    className={`bg-gradient-to-r ${plan.color} text-white text-center py-2 text-sm font-semibold`}
                  >
                    <Star className="inline-block w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader
                className={cn("text-center", plan.popular ? "pt-12" : "pt-6")}
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      /month
                    </span>
                  </div>
                  {/* 
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="line-through text-muted-foreground">${plan.originalPrice}</span>
                      <span className="text-green-600 font-semibold">
                        You save ${(plan.originalPrice - plan.price).toFixed(2)}
                      </span>
                    </div>
                  )} */}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <FeatureIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t border-muted">
                    <p className="text-xs text-muted-foreground mb-2">
                      Limitations:
                    </p>
                    <div className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <span className="text-xs text-muted-foreground">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 pb-4">
                <Button
                  className={cn(
                    "w-full py-6 text-lg font-semibold transition-all duration-300",
                    plan.popular &&
                      `bg-gradient-to-r ${plan.color} text-white border-0`
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isSelected ? (
                    <>
                      <Check className="size-5 mr-2" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Zap className="size-5 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-4 pt-8">
        <p className="text-muted-foreground">
          All plans include a 30-day free trial. No credit card required to
          start.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Headphones className="w-4 h-4 text-green-500" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
