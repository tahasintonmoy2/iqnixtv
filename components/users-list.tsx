"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function UsersList() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Mock data for users
  const users = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Admin",
      status: "active",
      lastActive: "2023-10-15",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "Editor",
      status: "active",
      lastActive: "2023-10-14",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.b@example.com",
      role: "Viewer",
      status: "active",
      lastActive: "2023-10-10",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.d@example.com",
      role: "Editor",
      status: "inactive",
      lastActive: "2023-09-28",
    },
    {
      id: "5",
      name: "Robert Wilson",
      email: "robert.w@example.com",
      role: "Viewer",
      status: "active",
      lastActive: "2023-10-12",
    },
  ]

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  const toggleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((user) => user !== id))
    } else {
      setSelectedUsers([...selectedUsers, id])
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <Input placeholder="Filter users..." className="max-w-sm" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
          </Button>
          <Button size="sm" className="h-8 px-2 lg:px-3">
            Add User
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleSelectUser(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`/placeholder.svg?text=${user.name.charAt(0)}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
