import { Genre } from "@/lib/generated/prisma"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useCategories() {
  const [categories, setCategories] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get("/api/categories")
      if (response.status !== 200) {
        throw new Error("Failed to fetch categories")
      }
      const data = response.data
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories")
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: {
    name: string
    color: string
    isPublished: boolean
  }) => {
    try {
      const response = await axios.post("/api/categories", categoryData)

      if (response.status !== 200 && response.status !== 201) {
        const errorData = await response.data
        throw new Error(errorData.error || "Failed to create category")
      }

      const newCategory = await response.data
      setCategories(prev => [newCategory, ...prev])
      toast.success("Category created successfully")
      return newCategory
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create category")
      throw error
    }
  }

  const updateCategory = async (
    categoryId: string,
    categoryData: {
      name: string
      color: string
      isPublished: boolean
    }
  ) => {
    try {
      const response = await axios.patch(`/api/categories/${categoryId}`, categoryData)

      if (response.status !== 200) {
        const errorData = await response.data
        throw new Error(errorData.error || "Failed to update category")
      }

      const updatedCategory = await response.data
      setCategories(prev =>
        prev.map(cat => (cat.id === categoryId ? updatedCategory : cat))
      )
      toast.success("Category updated successfully")
      return updatedCategory
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update category")
      throw error
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await axios.delete(`/api/categories/${categoryId}`)

      if (response.status !== 200) {
        const errorData = await response.data
        throw new Error(errorData.error || "Failed to delete category")
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
      throw error
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
} 