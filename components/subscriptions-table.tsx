"use client"

import { useState, useEffect } from "react"
import { CreditCard, Edit, MoreHorizontal, Trash2, UserCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for subscriptions
const subscriptions = [
  {
    id: "SUB-1234",
    userId: "USR-5678",
    userName: "John Smith",
    email: "john.smith@example.com",
    plan: "Premium",
    status: "active",
    amount: "$14.99",
    billingCycle: "Monthly",
    startDate: "2023-05-15",
    nextBillingDate: "2023-11-15",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "SUB-2345",
    userId: "USR-6789",
    userName: "Sarah Johnson",
    email: "sarah.j@example.com",
    plan: "Basic",
    status: "active",
    amount: "$7.99",
    billingCycle: "Monthly",
    startDate: "2023-06-22",
    nextBillingDate: "2023-11-22",
    paymentMethod: "Mastercard •••• 5555",
  },
  {
    id: "SUB-3456",
    userId: "USR-7890",
    userName: "Michael Brown",
    email: "michael.b@example.com",
    plan: "Family",
    status: "active",
    amount: "$19.99",
    billingCycle: "Monthly",
    startDate: "2023-04-10",
    nextBillingDate: "2023-11-10",
    paymentMethod: "PayPal",
  },
  {
    id: "SUB-4567",
    userId: "USR-8901",
    userName: "Emily Davis",
    email: "emily.d@example.com",
    plan: "Premium",
    status: "canceled",
    amount: "$14.99",
    billingCycle: "Monthly",
    startDate: "2023-02-05",
    nextBillingDate: "2023-11-05",
    paymentMethod: "Visa •••• 1111",
  },
  {
    id: "SUB-5678",
    userId: "USR-9012",
    userName: "Robert Wilson",
    email: "robert.w@example.com",
    plan: "Basic",
    status: "past_due",
    amount: "$7.99",
    billingCycle: "Monthly",
    startDate: "2023-07-18",
    nextBillingDate: "2023-11-18",
    paymentMethod: "Mastercard •••• 3333",
  },
  {
    id: "SUB-6789",
    userId: "USR-0123",
    userName: "Jennifer Lee",
    email: "jennifer.l@example.com",
    plan: "Premium",
    status: "active",
    amount: "$149.99",
    billingCycle: "Yearly",
    startDate: "2023-01-30",
    nextBillingDate: "2024-01-30",
    paymentMethod: "American Express •••• 9876",
  },
  {
    id: "SUB-7890",
    userId: "USR-1234",
    userName: "David Miller",
    email: "david.m@example.com",
    plan: "Family",
    status: "active",
    amount: "$19.99",
    billingCycle: "Monthly",
    startDate: "2023-08-12",
    nextBillingDate: "2023-11-12",
    paymentMethod: "Apple Pay",
  },
]

interface SubscriptionsTableProps {
  searchQuery?: string
  filters?: Record<string, any>
}

export function SubscriptionsTable({ searchQuery = "", filters = {} }: SubscriptionsTableProps) {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [filteredSubscriptions, setFilteredSubscriptions] = useState(subscriptions)

  // Filter subscriptions based on search query and filters
  useEffect(() => {
    let result = [...subscriptions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (subscription) =>
          subscription.userName.toLowerCase().includes(query) ||
          subscription.email.toLowerCase().includes(query) ||
          subscription.id.toLowerCase().includes(query) ||
          subscription.plan.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((subscription) => subscription.status === filters.status)
    }

    // Apply plan filter
    if (filters.plan) {
      result = result.filter((subscription) => subscription.plan === filters.plan)
    }

    // Apply billing cycle filter
    if (filters.billingCycle) {
      result = result.filter((subscription) => subscription.billingCycle === filters.billingCycle)
    }

    // Apply date filter
    if (filters.date) {
      // In a real app, you would filter by date
      // This is just a placeholder implementation
      console.log("Date filter applied:", filters.date)
    }

    setFilteredSubscriptions(result)

    // Reset selected subscriptions when filters change
    setSelectedSubscriptions([])
  }, [searchQuery, filters])

  const toggleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([])
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map((sub) => sub.id))
    }
  }

  const toggleSelectSubscription = (id: string) => {
    if (selectedSubscriptions.includes(id)) {
      setSelectedSubscriptions(selectedSubscriptions.filter((subId) => subId !== id))
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, id])
    }
  }

  const handleEditSubscription = (subscription: any) => {
    setCurrentSubscription(subscription)
    setShowEditDialog(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "canceled":
        return "secondary"
      case "past_due":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="w-full">
      {selectedSubscriptions.length > 0 && (
        <div className="bg-muted/50 mb-4 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedSubscriptions.length} item{selectedSubscriptions.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Selected
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Selected
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No subscriptions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSubscriptions.includes(subscription.id)}
                      onCheckedChange={() => toggleSelectSubscription(subscription.id)}
                      aria-label={`Select ${subscription.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subscription.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{subscription.userName}</span>
                      <span className="text-xs text-muted-foreground">{subscription.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{subscription.plan}</span>
                      <span className="text-xs text-muted-foreground">{subscription.billingCycle}</span>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(subscription.status)}>
                      {subscription.status === "active"
                        ? "Active"
                        : subscription.status === "canceled"
                          ? "Canceled"
                          : "Past Due"}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.nextBillingDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{subscription.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" />
                          View User Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Subscription Dialog */}
      {currentSubscription && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>Update subscription details for {currentSubscription.userName}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 text-sm font-medium">Subscription ID:</span>
                <span className="col-span-3">{currentSubscription.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 text-sm font-medium">User:</span>
                <span className="col-span-3">{currentSubscription.userName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 text-sm font-medium">Current Plan:</span>
                <Select defaultValue={currentSubscription.plan}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic ($7.99/month)</SelectItem>
                    <SelectItem value="Premium">Premium ($14.99/month)</SelectItem>
                    <SelectItem value="Family">Family ($19.99/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 text-sm font-medium">Billing Cycle:</span>
                <Select defaultValue={currentSubscription.billingCycle}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="col-span-1 text-sm font-medium">Status:</span>
                <Select defaultValue={currentSubscription.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowEditDialog(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
