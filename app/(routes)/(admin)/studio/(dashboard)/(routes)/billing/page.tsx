"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillingHeader } from "@/components/billing-header"
import { DashboardHeader } from "@/components/dashboard-header"
import { RevenueChart } from "@/components/revenue-chart"
import { SubscriptionMetrics } from "@/components/subscription-metrics"
import { SubscriptionsTable } from "@/components/subscriptions-table"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { PaymentHistory } from "@/components/payment-history"

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // In a real app, you would filter the data based on the query
    console.log("Searching for:", query)
  }

  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters)
    // In a real app, you would filter the data based on the filters
    console.log("Filters applied:", filters)
  }

  return (
    <>
      <DashboardHeader heading="Billing & Subscriptions" text="Manage user subscriptions and billing information" />

      <BillingHeader onSearch={handleSearch} onFilterChange={handleFilterChange} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,580.45</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,642</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Subscription Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$14.99</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">-0.8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>View and manage all user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionsTable searchQuery={searchQuery} filters={activeFilters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage available subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlans searchQuery={"searchQuery"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View payment history and transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistory searchQuery={searchQuery} filters={activeFilters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Track subscription revenue and growth metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <RevenueChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Metrics</CardTitle>
              <CardDescription>Detailed subscription performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionMetrics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
