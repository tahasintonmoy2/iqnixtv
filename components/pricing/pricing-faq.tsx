"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqData = [
  {
    id: 1,
    question: "How does the free trial work?",
    answer:
      "All new subscribers get a 30-day free trial with full access to their chosen plan. No credit card required to start. You can cancel anytime during the trial period without being charged.",
  },
  {
    id: 2,
    question: "Can I change my plan anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades. You'll be charged the prorated difference.",
  },
  {
    id: 3,
    question: "What devices are supported?",
    answer:
      "Our platform works on smartphones, tablets, computers, smart TVs, gaming consoles, and streaming devices. The specific devices available depend on your subscription plan.",
  },
  {
    id: 4,
    question: "Can I download content for offline viewing?",
    answer:
      "Standard and Premium plans include offline downloads. Standard allows up to 10 titles, while Premium offers unlimited downloads. Downloaded content expires after 30 days or 48 hours after you start watching.",
  },
  {
    id: 5,
    question: "Is there a student discount available?",
    answer:
      "Yes! Students with a valid .edu email address can get 50% off any plan. The discount is verified annually and can be used for up to 4 years.",
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers in select regions.",
  },
  {
    id: 7,
    question: "Can I share my account with family?",
    answer:
      "Account sharing is allowed within your household based on your plan's device limits. Standard allows 2 simultaneous streams, Premium allows 4. Each plan includes profile management for personalized recommendations.",
  },
  {
    id: 8,
    question: "What happens if I cancel my subscription?",
    answer:
      "You can cancel anytime with no cancellation fees. You'll continue to have access until the end of your current billing period. Your account and preferences are saved for 12 months in case you want to reactivate.",
  },
  {
    id: 9,
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! The price you see is what you pay. Taxes may apply based on your location. We'll always show the total amount before you confirm any purchase.",
  },
  {
    id: 10,
    question: "How often is new content added?",
    answer:
      "We add new content weekly, including exclusive originals, latest episodes, and popular movies. Premium subscribers get early access to select content and exclusive behind-the-scenes material.",
  },
]

export function PricingFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Got questions? We&apos;ve got answers. Find everything you need to know about our subscription plans.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqData.map((faq) => (
          <Card key={faq.id} className="overflow-hidden">
            <Collapsible open={openItems.includes(faq.id)} onOpenChange={() => toggleItem(faq.id)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
                  <h3 className="text-left font-semibold text-lg">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                      openItems.includes(faq.id) ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4 pt-8">
        <p className="text-muted-foreground">Still have questions? We&apos;re here to help!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/contact" className="text-primary hover:underline font-medium">
            Contact Support
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="/help" className="text-primary hover:underline font-medium">
            Help Center
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="/live-chat" className="text-primary hover:underline font-medium">
            Live Chat
          </a>
        </div>
      </div>
    </div>
  )
}
