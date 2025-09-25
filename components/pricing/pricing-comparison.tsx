"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Tv, Smartphone } from "lucide-react";

const comparisonFeatures = [
  {
    category: "Streaming Quality",
    features: [
      { name: "HD (720p)", basic: true, standard: true, premium: true },
      { name: "Full HD (1080p)", basic: false, standard: true, premium: true },
      { name: "4K Ultra HD", basic: false, standard: false, premium: true },
      { name: "HDR Support", basic: false, standard: false, premium: true },
    ],
  },
  {
    category: "Audio Experience",
    features: [
      { name: "Standard Audio", basic: true, standard: true, premium: true },
      { name: "Enhanced Audio", basic: false, standard: true, premium: true },
      { name: "Dolby Atmos", basic: false, standard: false, premium: true },
      {
        name: "Multi-language Audio",
        basic: false,
        standard: true,
        premium: true,
      },
    ],
  },
  {
    category: "Device Access",
    features: [
      { name: "Mobile & Tablet", basic: true, standard: true, premium: true },
      {
        name: "Computer & Laptop",
        basic: false,
        standard: true,
        premium: true,
      },
      { name: "Smart TV", basic: false, standard: true, premium: true },
      { name: "Gaming Consoles", basic: false, standard: false, premium: true },
    ],
  },
  {
    category: "Simultaneous Streams",
    features: [
      { name: "1 Device", basic: true, standard: false, premium: false },
      { name: "2 Devices", basic: false, standard: true, premium: false },
      { name: "4 Devices", basic: false, standard: false, premium: true },
    ],
  },
  {
    category: "Downloads & Offline",
    features: [
      {
        name: "Offline Downloads",
        basic: false,
        standard: true,
        premium: true,
      },
      {
        name: "Download Limit",
        basic: "N/A",
        standard: "10 titles",
        premium: "Unlimited",
      },
      { name: "Download Quality", basic: "N/A", standard: "HD", premium: "4K" },
    ],
  },
  {
    category: "Content & Features",
    features: [
      {
        name: "Ad-free Experience",
        basic: false,
        standard: false,
        premium: true,
      },
      {
        name: "Early Access Content",
        basic: false,
        standard: false,
        premium: true,
      },
      {
        name: "Exclusive Content",
        basic: false,
        standard: false,
        premium: true,
      },
      {
        name: "Parental Controls",
        basic: false,
        standard: true,
        premium: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Email Support", basic: true, standard: true, premium: true },
      { name: "Priority Support", basic: false, standard: true, premium: true },
      { name: "24/7 Live Chat", basic: false, standard: false, premium: true },
      { name: "Phone Support", basic: false, standard: false, premium: true },
    ],
  },
];

const planIcons = {
  basic: Smartphone,
  standard: Tv,
  premium: Crown,
};

const planColors = {
  basic: "from-blue-500 to-cyan-500",
  standard: "from-purple-500 to-pink-500",
  premium: "from-yellow-500 to-orange-500",
};

export function PricingComparison() {
  const renderFeatureValue = (
    value: boolean | string,
    planType: "basic" | "standard" | "premium"
  ) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground mx-auto" />
      );
    }

    return (
      <span
        className={`text-sm font-medium ${value === "N/A" ? "text-muted-foreground" : "text-foreground"}`}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Compare All Features</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See exactly what&apos;s included in each plan to make the best choice
          for your needs
        </p>
      </div>

      <Card className="overflow-hidden p-4">
        <CardHeader>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-left">
              <CardTitle className="text-lg">Features</CardTitle>
            </div>
            {(["basic", "standard", "premium"] as const).map((plan) => {
              const IconComponent = planIcons[plan];
              return (
                <div key={plan} className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${planColors[plan]} flex items-center justify-center mb-2`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg capitalize">{plan}</CardTitle>
                  {plan === "standard" && (
                    <Badge className="mt-1 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {comparisonFeatures.map((category, categoryIndex) => (
            <div
              key={category.category}
              className={categoryIndex > 0 ? "border-t" : ""}
            >
              <div className="bg-muted/30 px-6 py-3">
                <h3 className="font-semibold text-lg">{category.category}</h3>
              </div>

              {category.features.map((feature, featureIndex) => (
                <div
                  key={feature.name}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 items-center ${
                    featureIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <div className="text-left">
                    <span className="font-medium">{feature.name}</span>
                  </div>

                  <div className="text-center">
                    {renderFeatureValue(feature.basic, "basic")}
                  </div>

                  <div className="text-center">
                    {renderFeatureValue(feature.standard, "standard")}
                  </div>

                  <div className="text-center">
                    {renderFeatureValue(feature.premium, "premium")}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
