"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SubscriptionMetrics() {
  const [sortColumn, setSortColumn] = useState("revenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Mock data for subscription metrics
  const subscriptionMetrics = [
    {
      id: "1",
      plan: "Premium",
      subscribers: 5621,
      revenue: 84238.79,
      avgLifetime: 14,
      churnRate: 3.2,
      conversionRate: 68.5,
    },
    {
      id: "2",
      plan: "Basic",
      subscribers: 3245,
      revenue: 25927.55,
      avgLifetime: 9,
      churnRate: 4.8,
      conversionRate: 52.3,
    },
    {
      id: "3",
      plan: "Family",
      subscribers: 2134,
      revenue: 42658.66,
      avgLifetime: 18,
      churnRate: 2.5,
      conversionRate: 74.2,
    },
    {
      id: "4",
      plan: "Premium (Yearly)",
      subscribers: 1245,
      revenue: 186737.55,
      avgLifetime: 24,
      churnRate: 1.8,
      conversionRate: 82.7,
    },
    {
      id: "5",
      plan: "Basic (Yearly)",
      subscribers: 876,
      revenue: 70018.24,
      avgLifetime: 20,
      churnRate: 2.2,
      conversionRate: 76.5,
    },
  ]

  const sortedMetrics = [...subscriptionMetrics].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("subscribers")}>
                  Subscribers
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "subscribers" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("revenue")}>
                  Revenue
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "revenue" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("avgLifetime")}>
                  Avg. Lifetime
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "avgLifetime" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("churnRate")}>
                  Churn Rate
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "churnRate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("conversionRate")}>
                  Conversion
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "conversionRate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">{metric.plan}</TableCell>
                <TableCell>{metric.subscribers.toLocaleString()}</TableCell>
                <TableCell>
                  ${metric.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{metric.avgLifetime} months</TableCell>
                <TableCell>{metric.churnRate}%</TableCell>
                <TableCell>{metric.conversionRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
