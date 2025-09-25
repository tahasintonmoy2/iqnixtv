"use client"

import { Zap } from "lucide-react"

export function Pricing() {
  return (
    <div className="text-center space-y-6 py-12">
      <div className="flex justify-center items-center space-x-2 mb-4">
        <Zap className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Choose Your Perfect Plan
      </h1>

      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        Unlock unlimited entertainment with our flexible subscription plans. From casual viewing to premium experiences,
        we have the perfect tier for everyone.
      </p>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>No contracts</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>30-day free trial</span>
        </div>
      </div>
    </div>
  )
}
