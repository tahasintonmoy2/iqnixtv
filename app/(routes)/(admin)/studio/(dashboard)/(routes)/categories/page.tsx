"use client"

import { AddCategoryDialog } from "@/components/add-category-dialog"
import { CategoriesList } from "@/components/categories-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCategories } from "@/hooks/use-categories"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CategoriesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { createCategory } = useCategories()
  const router = useRouter()

  const handleCategoryCreated = async (categoryData: { name: string; color: string; isPublished: boolean }) => {
    try {
      const category = await createCategory(categoryData)
      // Refresh the page after successful category creation
      router.refresh()
      return category
    } catch (error) {
      // Error is handled by the hook
      throw error
    }
  }

  return (
    <>
      <DashboardHeader heading="Content Categories" text="Organize your content with custom categories">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage categories to organize your content library</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesList />
        </CardContent>
      </Card>

      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={(category) => {
          console.log("Category saved:", category)
          setShowAddDialog(false)
        }}
        onCreateCategory={handleCategoryCreated}
      />
    </>
  )
}
