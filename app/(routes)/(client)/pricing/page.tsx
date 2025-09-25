"use client"

import { Pricing } from "@/components/pricing/pricing"
import { PricingComparison } from "@/components/pricing/pricing-comparison"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { PricingTestimonials } from "@/components/pricing/pricing-testimonials"
import { PricingTiers } from "@/components/pricing/pricing-tiers"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-16">
        <Pricing />
        <PricingTiers />
        <PricingComparison />
        <PricingTestimonials />
        <PricingFAQ />
      </div>
    </div>
  )
}
