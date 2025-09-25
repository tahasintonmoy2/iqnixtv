"use client"

import { useState } from "react"
import { Check, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

// Mock data for subscription plans
const plans = [
  {
    id: "plan-basic",
    name: "Basic",
    description: "Access to all standard content with ads",
    monthlyPrice: 7.99,
    yearlyPrice: 79.99,
    features: [
      "Standard video quality",
      "Watch on 1 device at a time",
      "Ad-supported streaming",
      "Limited content library",
    ],
    isPopular: false,
    isActive: true,
    subscribers: 3245,
  },
  {
    id: "plan-premium",
    name: "Premium",
    description: "Ad-free viewing with HD quality",
    monthlyPrice: 14.99,
    yearlyPrice: 149.99,
    features: [
      "HD video quality",
      "Watch on 2 devices at a time",
      "Ad-free streaming",
      "Full content library",
      "Download for offline viewing",
    ],
    isPopular: true,
    isActive: true,
    subscribers: 5621,
  },
  {
    id: "plan-family",
    name: "Family",
    description: "Share with your family, up to 5 profiles",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    features: [
      "4K Ultra HD video quality",
      "Watch on 5 devices at a time",
      "Ad-free streaming",
      "Full content library",
      "Download for offline viewing",
      "Family sharing",
    ],
    isPopular: false,
    isActive: true,
    subscribers: 2134,
  },
]

export function SubscriptionPlans() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)

  const handleEditPlan = (plan: any) => {
    setCurrentPlan(plan)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Available Plans</h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.isPopular ? "border-primary" : ""}>
            {plan.isPopular && (
              <div className="absolute right-4 top-0 translate-y-[-50%] rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-sm font-medium text-muted-foreground">/month</span>
                  </div>
                  <span className="text-sm text-muted-foreground">or ${plan.yearlyPrice}/year</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.subscribers.toLocaleString()} active subscribers</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch id={`active-${plan.id}`} checked={plan.isActive} />
                <Label htmlFor={`active-${plan.id}`}>Active</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Plan Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Subscription Plan</DialogTitle>
            <DialogDescription>Create a new subscription plan for your platform.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-name" className="text-right">
                Plan Name
              </Label>
              <Input id="plan-name" placeholder="e.g. Premium Plus" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-description" className="text-right">
                Description
              </Label>
              <Textarea id="plan-description" placeholder="Brief description of the plan" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly-price" className="text-right">
                Monthly Price ($)
              </Label>
              <Input id="monthly-price" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yearly-price" className="text-right">
                Yearly Price ($)
              </Label>
              <Input id="yearly-price" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Features</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Input placeholder="e.g. HD video quality" />
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input placeholder="e.g. Ad-free streaming" />
                  <Button variant="outline" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Popular Plan</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="popular-plan" />
                <Label htmlFor="popular-plan">Mark as most popular</Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="plan-active" defaultChecked />
                <Label htmlFor="plan-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      {currentPlan && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Subscription Plan</DialogTitle>
              <DialogDescription>Update the details for the {currentPlan.name} plan.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-plan-name" className="text-right">
                  Plan Name
                </Label>
                <Input id="edit-plan-name" defaultValue={currentPlan.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-plan-description" className="text-right">
                  Description
                </Label>
                <Textarea id="edit-plan-description" defaultValue={currentPlan.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-monthly-price" className="text-right">
                  Monthly Price ($)
                </Label>
                <Input
                  id="edit-monthly-price"
                  type="number"
                  step="0.01"
                  defaultValue={currentPlan.monthlyPrice}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-yearly-price" className="text-right">
                  Yearly Price ($)
                </Label>
                <Input
                  id="edit-yearly-price"
                  type="number"
                  step="0.01"
                  defaultValue={currentPlan.yearlyPrice}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Features</Label>
                <div className="col-span-3 space-y-2">
                  {currentPlan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input defaultValue={feature} />
                      <Button variant="outline" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Popular Plan</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch id="edit-popular-plan" defaultChecked={currentPlan.isPopular} />
                  <Label htmlFor="edit-popular-plan">Mark as most popular</Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch id="edit-plan-active" defaultChecked={currentPlan.isActive} />
                  <Label htmlFor="edit-plan-active">Active</Label>
                </div>
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
