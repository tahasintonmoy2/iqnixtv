"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for revenue
const monthlyData = [
  { name: "Jan", revenue: 12450, subscribers: 7845, churn: 245 },
  { name: "Feb", revenue: 14250, subscribers: 8125, churn: 278 },
  { name: "Mar", revenue: 15750, subscribers: 8456, churn: 312 },
  { name: "Apr", revenue: 16890, subscribers: 8765, churn: 298 },
  { name: "May", revenue: 18450, subscribers: 9123, churn: 276 },
  { name: "Jun", revenue: 19870, subscribers: 9456, churn: 265 },
  { name: "Jul", revenue: 21340, subscribers: 9876, churn: 287 },
  { name: "Aug", revenue: 22560, subscribers: 10234, churn: 302 },
  { name: "Sep", revenue: 23780, subscribers: 10567, churn: 312 },
  { name: "Oct", revenue: 24980, subscribers: 10876, churn: 298 },
  { name: "Nov", revenue: 26340, subscribers: 11234, churn: 276 },
  { name: "Dec", revenue: 27890, subscribers: 11567, churn: 265 },
]

const quarterlyData = [
  { name: "Q1", revenue: 42450, subscribers: 8456, churn: 835 },
  { name: "Q2", revenue: 55210, subscribers: 9456, churn: 839 },
  { name: "Q3", revenue: 67680, subscribers: 10567, churn: 901 },
  { name: "Q4", revenue: 79210, subscribers: 11567, churn: 839 },
]

const yearlyData = [
  { name: "2019", revenue: 156780, subscribers: 6789, churn: 2345 },
  { name: "2020", revenue: 198450, subscribers: 8234, churn: 2678 },
  { name: "2021", revenue: 245670, subscribers: 9876, churn: 2987 },
  { name: "2022", revenue: 289340, subscribers: 10987, churn: 3123 },
  { name: "2023", revenue: 344550, subscribers: 11567, churn: 3414 },
]

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState("monthly")
  const [chartType, setChartType] = useState("area")

  const data = timeRange === "monthly" ? monthlyData : timeRange === "quarterly" ? quarterlyData : yearlyData

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value}`
  }

  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex space-x-2">
          <Button variant={chartType === "area" ? "default" : "outline"} size="sm" onClick={() => setChartType("area")}>
            Area
          </Button>
          <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
            Bar
          </Button>
          <Button variant={chartType === "line" ? "default" : "outline"} size="sm" onClick={() => setChartType("line")}>
            Line
          </Button>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          ) : chartType === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data[data.length - 1].subscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total Subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.reduce((sum, item) => sum + item.churn, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Churn</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
