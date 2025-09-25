import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsMetrics } from "@/components/analytics-metrics"

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader heading="Analytics" text="View platform performance and user engagement metrics">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: Today at 09:45 AM</span>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234,567</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 min</div>
            <p className="text-xs text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.3%</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.7%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>Detailed metrics and trends for your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>View performance metrics by content</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsMetrics />
        </CardContent>
      </Card>
    </>
  )
}
