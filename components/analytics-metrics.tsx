"use client"

import { useState } from "react"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AnalyticsMetrics() {
  const [sortColumn, setSortColumn] = useState("views")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Mock data for content performance
  const contentPerformance = [
    {
      id: "1",
      title: "The Adventure Begins",
      type: "Series - S01E01",
      views: 24500,
      completion: 78,
      watchTime: 38,
      engagement: 8.7,
    },
    {
      id: "2",
      title: "Journey to the Unknown",
      type: "Movie",
      views: 18300,
      completion: 82,
      watchTime: 112,
      engagement: 9.2,
    },
    {
      id: "3",
      title: "The Revelation",
      type: "Series - S02E05",
      views: 16900,
      completion: 85,
      watchTime: 41,
      engagement: 9.5,
    },
    {
      id: "4",
      title: "Star Travelers",
      type: "Movie",
      views: 12200,
      completion: 76,
      watchTime: 105,
      engagement: 8.3,
    },
    {
      id: "5",
      title: "Final Countdown",
      type: "Series - S03E10",
      views: 10100,
      completion: 92,
      watchTime: 47,
      engagement: 9.8,
    },
    {
      id: "6",
      title: "Mystery of the Deep",
      type: "Movie",
      views: 8500,
      completion: 68,
      watchTime: 95,
      engagement: 7.6,
    },
    {
      id: "7",
      title: "New Horizons",
      type: "Series - S04E01",
      views: 7200,
      completion: 74,
      watchTime: 36,
      engagement: 8.1,
    },
  ]

  const sortedContent = [...contentPerformance].sort((a, b) => {
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
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("views")}>
                  Views
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "views" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("completion")}>
                  Completion
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "completion" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("watchTime")}>
                  Avg. Watch Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "watchTime" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("engagement")}>
                  Engagement
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                  {sortColumn === "engagement" &&
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
            {sortedContent.map((content) => (
              <TableRow key={content.id}>
                <TableCell className="font-medium">{content.title}</TableCell>
                <TableCell>{content.type}</TableCell>
                <TableCell>{content.views.toLocaleString()}</TableCell>
                <TableCell>{content.completion}%</TableCell>
                <TableCell>{content.watchTime} min</TableCell>
                <TableCell>{content.engagement}/10</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
