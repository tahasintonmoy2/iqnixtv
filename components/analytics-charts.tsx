"use client"

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const viewsData = [
  { name: "Jan", views: 45000 },
  { name: "Feb", views: 52000 },
  { name: "Mar", views: 49000 },
  { name: "Apr", views: 63000 },
  { name: "May", views: 71000 },
  { name: "Jun", views: 85000 },
  { name: "Jul", views: 92000 },
  { name: "Aug", views: 86000 },
  { name: "Sep", views: 94000 },
  { name: "Oct", views: 105000 },
  { name: "Nov", views: 112000 },
  { name: "Dec", views: 120000 },
]

const engagementData = [
  { name: "Jan", completion: 68, watchTime: 32 },
  { name: "Feb", completion: 70, watchTime: 34 },
  { name: "Mar", completion: 69, watchTime: 33 },
  { name: "Apr", completion: 72, watchTime: 36 },
  { name: "May", completion: 74, watchTime: 38 },
  { name: "Jun", completion: 75, watchTime: 40 },
  { name: "Jul", completion: 77, watchTime: 42 },
  { name: "Aug", completion: 76, watchTime: 41 },
  { name: "Sep", completion: 78, watchTime: 43 },
  { name: "Oct", completion: 79, watchTime: 44 },
  { name: "Nov", completion: 80, watchTime: 45 },
  { name: "Dec", completion: 82, watchTime: 47 },
]

export function AnalyticsCharts() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Monthly Views</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={viewsData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip />
              <Bar dataKey="views" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Engagement Metrics</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="watchTime"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
