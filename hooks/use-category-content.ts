import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useCategoryContent(category: string, limit: number = 10) {
  const [content, setContent] = useState<CategoryContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/api/series/by-category?category=${category}&limit=${limit}`)
      if (response.status !== 200) {
        throw new Error("Failed to fetch content")
      }
      const data = response.data
      setContent(data)
    } catch (error) {
      console.error("Error fetching category content:", error)
      setError("Failed to load content")
      toast.error("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (category) {
      fetchContent()
    }
  }, [category, limit])

  return {
    content,
    loading,
    error,
    refetch: fetchContent
  }
} 