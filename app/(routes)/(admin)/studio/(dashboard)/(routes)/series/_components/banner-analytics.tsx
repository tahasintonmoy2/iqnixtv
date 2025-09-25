"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const performanceData = [
  { name: "Jan", impressions: 45000, clicks: 2250, ctr: 5.0 },
  { name: "Feb", impressions: 52000, clicks: 2860, ctr: 5.5 },
  { name: "Mar", impressions: 48000, clicks: 2400, ctr: 5.0 },
  { name: "Apr", impressions: 61000, clicks: 3660, ctr: 6.0 },
  { name: "May", impressions: 55000, clicks: 3300, ctr: 6.0 },
  { name: "Jun", impressions: 67000, clicks: 4690, ctr: 7.0 },
]

const bannerPerformance = [
  {
    id: "1",
    title: "Stranger Things Season 5",
    impressions: 125000,
    clicks: 8750,
    ctr: 7.0,
    conversions: 1250,
    status: "active",
  },
  {
    id: "2",
    title: "Action Movies Collection",
    impressions: 89000,
    clicks: 4450,
    ctr: 5.0,
    conversions: 890,
    status: "scheduled",
  },
  {
    id: "3",
    title: "Holiday Special",
    impressions: 67000,
    clicks: 3350,
    ctr: 5.0,
    conversions: 670,
    status: "expired",
  },
  {
    id: "4",
    title: "New Releases",
    impressions: 45000,
    clicks: 1800,
    ctr: 4.0,
    conversions: 360,
    status: "active",
  },
]

const deviceData = [
  { name: "Desktop", value: 45, color: "#8884d8" },
  { name: "Mobile", value: 35, color: "#82ca9d" },
  { name: "Tablet", value: 20, color: "#ffc658" },
]

const segmentData = [
  { name: "Premium Users", value: 40, color: "#8884d8" },
  { name: "Free Users", value: 30, color: "#82ca9d" },
  { name: "New Users", value: 20, color: "#ffc658" },
  { name: "Returning Users", value: 10, color: "#ff7300" },
]

export function BannerAnalytics() {
  const [timeRange, setTimeRange] = useState("6m")

  const totalImpressions = bannerPerformance.reduce((sum, banner) => sum + banner.impressions, 0)
  const totalClicks = bannerPerformance.reduce((sum, banner) => sum + banner.clicks, 0)
  const totalConversions = bannerPerformance.reduce((sum, banner) => sum + banner.conversions, 0)
  const avgCTR = (totalClicks / totalImpressions) * 100

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banner Analytics</h2>
          <p className="text-muted-foreground">Track performance and engagement metrics for your promotional banners</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCTR.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+0.3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.1% from last period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="banners">Banner Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impressions & Clicks Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
                    <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Click-Through Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ctr" stroke="#8884d8" strokeWidth={2} name="CTR (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Banner Performance</CardTitle>
              <CardDescription>Performance metrics for each banner campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bannerPerformance.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{banner.title}</h3>
                        <Badge variant={banner.status === "active" ? "default" : "secondary"}>{banner.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{banner.impressions.toLocaleString()} impressions</span>
                        <span>{banner.clicks.toLocaleString()} clicks</span>
                        <span>{banner.ctr}% CTR</span>
                        <span>{banner.conversions} conversions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Performance Score</div>
                      <Progress value={banner.ctr * 10} className="w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Banner views by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Banner engagement by user segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>Key insights about your banner audience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">65%</div>
                  <p className="text-sm text-muted-foreground">Mobile Users</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.2s</div>
                  <p className="text-sm text-muted-foreground">Avg. View Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-sm text-muted-foreground">Return Viewers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
