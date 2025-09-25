"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Premium Subscriber",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    content:
      "The 4K quality is absolutely stunning! The Dolby Atmos audio makes every drama feel like a cinematic experience. Worth every penny.",
    plan: "Premium",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Standard Subscriber",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    content:
      "Perfect for our family. Two devices is just right, and the HD quality is great. The kids love the offline downloads for road trips.",
    plan: "Standard",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Basic Subscriber",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    content:
      "Great value for money! As a student, the basic plan gives me access to all my favorite shows on my phone and tablet.",
    plan: "Basic",
  },
]

export function PricingTestimonials() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">What Our Subscribers Say</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of happy viewers who&apos;ve found their perfect plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating ? "text-yellow-500 fill-current" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <p className="text-muted-foreground italic">&quot;{testimonial.content}&quot;</p>

              <div className="flex items-center space-x-3 pt-4 border-t">
                <Avatar>
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{testimonial.plan}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
