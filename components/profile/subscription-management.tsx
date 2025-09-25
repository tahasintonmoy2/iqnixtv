"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  Monitor,
  Users,
} from "lucide-react";
import { useState } from "react";

type Subscription = {
  plan: string;
  status: string;
  nextBilling: string;
  price: string;
};

type SubscriptionManagementProps = {
  subscription: Subscription;
  compact?: boolean;
};

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$8.99",
    period: "month",
    features: [
      "HD streaming",
      "1 device at a time",
      "Limited downloads",
      "Basic support",
    ],
    icon: Monitor,
    color: "text-blue-500",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$12.99",
    period: "month",
    features: [
      "4K Ultra HD streaming",
      "4 devices simultaneously",
      "Unlimited downloads",
      "Priority support",
      "Early access to new content",
    ],
    icon: Crown,
    color: "text-purple-500",
    popular: true,
  },
  {
    id: "family",
    name: "Family",
    price: "$16.99",
    period: "month",
    features: [
      "4K Ultra HD streaming",
      "6 devices simultaneously",
      "Unlimited downloads",
      "Premium support",
      "Family profiles",
      "Parental controls",
    ],
    icon: Users,
    color: "text-green-500",
    popular: false,
  },
];

export function SubscriptionManagement({
  subscription,
  compact = false,
}: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState(
    subscription.plan.toLowerCase()
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const currentPlan = plans.find((plan) => plan.id === selectedPlan);
  const nextBillingDate = new Date(subscription.nextBilling);
  const daysUntilBilling = Math.ceil(
    (nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (compact) {
    return (
      <Card className="py-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{subscription.plan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {subscription.price}
              </p>
            </div>
            <Badge
              variant={
                subscription.status === "active" ? "default" : "secondary"
              }
            >
              {subscription.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next billing</span>
              <span>{format(nextBillingDate, "MMM dd, yyyy")}</span>
            </div>
            <Progress
              value={((30 - daysUntilBilling) / 30) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              {daysUntilBilling} days remaining
            </p>
          </div>

          <Button className="w-full" variant="outline">
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="py-4">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">{subscription.plan} Plan</span>
              </div>
              <p className="text-2xl font-bold">{subscription.price}</p>
              <Badge
                variant={
                  subscription.status === "active" ? "default" : "secondary"
                }
              >
                {subscription.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Next Billing</span>
              </div>
              <p className="text-lg">
                {format(nextBillingDate, "MMMM dd, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {daysUntilBilling} days remaining
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Total Saved</span>
              </div>
              <p className="text-lg">$24.00</p>
              <p className="text-sm text-muted-foreground">
                vs monthly billing
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button variant="outline" className="flex-1">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              onClick={() => setBillingCycle("yearly")}
              className="relative"
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 text-xs">
                Save 20%
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <p className="text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === selectedPlan;
              const yearlyPrice =
                billingCycle === "yearly"
                  ? `$${(parseFloat(plan.price.replace("$", "")) * 12 * 0.8).toFixed(2)}`
                  : `$${(parseFloat(plan.price.replace("$", "")) * 12).toFixed(2)}`;

              return (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    isCurrentPlan ? "ring-2 ring-primary" : ""
                  } ${plan.popular ? "border-primary" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto p-3 rounded-full bg-muted w-fit ${plan.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold">
                        {billingCycle === "monthly"
                          ? plan.price
                          : `$${(parseFloat(plan.price.replace("$", "")) * 0.8).toFixed(2)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per{" "}
                        {billingCycle === "monthly"
                          ? "month"
                          : "month, billed yearly"}
                      </p>
                      {billingCycle === "yearly" && (
                        <p className="text-xs text-green-600 font-medium">
                          {yearlyPrice} per year (Save 20%)
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "secondary" : "default"}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">156</div>
              <p className="text-sm text-muted-foreground">Hours Watched</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">23</div>
              <p className="text-sm text-muted-foreground">Shows Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">45</div>
              <p className="text-sm text-muted-foreground">Movies Watched</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">12</div>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
