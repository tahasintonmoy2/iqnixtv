import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { UsersList } from "@/components/users-list"
import { UserPlus } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="h-screen">
      <DashboardHeader heading="User Management" text="Manage platform users and permissions">
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>View and manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList />
        </CardContent>
      </Card>
    </div>
  )
}
