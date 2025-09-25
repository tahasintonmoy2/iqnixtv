"use client"

import { useState, useEffect } from "react"
import { Download, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for payment history
const payments = [
  {
    id: "INV-1234",
    userId: "USR-5678",
    userName: "John Smith",
    email: "john.smith@example.com",
    amount: "$14.99",
    status: "successful",
    date: "2023-10-15",
    paymentMethod: "Visa •••• 4242",
    subscriptionId: "SUB-1234",
    plan: "Premium",
  },
  {
    id: "INV-2345",
    userId: "USR-6789",
    userName: "Sarah Johnson",
    email: "sarah.j@example.com",
    amount: "$7.99",
    status: "successful",
    date: "2023-10-14",
    paymentMethod: "Mastercard •••• 5555",
    subscriptionId: "SUB-2345",
    plan: "Basic",
  },
  {
    id: "INV-3456",
    userId: "USR-7890",
    userName: "Michael Brown",
    email: "michael.b@example.com",
    amount: "$19.99",
    status: "successful",
    date: "2023-10-10",
    paymentMethod: "PayPal",
    subscriptionId: "SUB-3456",
    plan: "Family",
  },
  {
    id: "INV-4567",
    userId: "USR-8901",
    userName: "Emily Davis",
    email: "emily.d@example.com",
    amount: "$14.99",
    status: "failed",
    date: "2023-10-05",
    paymentMethod: "Visa •••• 1111",
    subscriptionId: "SUB-4567",
    plan: "Premium",
  },
  {
    id: "INV-5678",
    userId: "USR-9012",
    userName: "Robert Wilson",
    email: "robert.w@example.com",
    amount: "$7.99",
    status: "pending",
    date: "2023-10-18",
    paymentMethod: "Mastercard •••• 3333",
    subscriptionId: "SUB-5678",
    plan: "Basic",
  },
  {
    id: "INV-6789",
    userId: "USR-0123",
    userName: "Jennifer Lee",
    email: "jennifer.l@example.com",
    amount: "$149.99",
    status: "successful",
    date: "2023-01-30",
    paymentMethod: "American Express •••• 9876",
    subscriptionId: "SUB-6789",
    plan: "Premium (Yearly)",
  },
  {
    id: "INV-7890",
    userId: "USR-1234",
    userName: "David Miller",
    email: "david.m@example.com",
    amount: "$19.99",
    status: "refunded",
    date: "2023-09-12",
    paymentMethod: "Apple Pay",
    subscriptionId: "SUB-7890",
    plan: "Family",
  },
]

interface PaymentHistoryProps {
  searchQuery?: string
  filters?: Record<string, any>
}

export function PaymentHistory({ searchQuery = "", filters = {} }: PaymentHistoryProps) {
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const [statusFilter, setStatusFilter] = useState("all")
  const [date, setDate] = useState<Date>()

  // Filter payments based on search query and filters
  useEffect(() => {
    let result = [...payments]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (payment) =>
          payment.userName.toLowerCase().includes(query) ||
          payment.email.toLowerCase().includes(query) ||
          payment.id.toLowerCase().includes(query) ||
          payment.plan.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((payment) => payment.status === filters.status)
    }

    // Apply date filter
    if (filters.date) {
      // In a real app, you would filter by date
      // This is just a placeholder implementation
      console.log("Date filter applied:", filters.date)
    }

    setFilteredPayments(result)
  }, [searchQuery, filters])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "successful":
        return "default"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      case "refunded":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="w-full">
      {/* <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-row space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div> */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No payments found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{payment.userName}</span>
                      <span className="text-xs text-muted-foreground">{payment.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
