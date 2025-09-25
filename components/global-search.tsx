"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Film, User, CreditCard, Tag, ArrowRight, FileText, BarChart, Settings, Loader2 } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Mock data for search results
const mockSearchData = {
  cast: [
    {
      id: "cast-1",
      name: "Emma Thompson",
      role: "Actor",
      photo: "/placeholder.svg?height=40&width=40",
      featured: true,
    },
    { id: "cast-2", name: "Michael Chen", role: "Actor", photo: "/placeholder.svg?height=40&width=40", featured: true },
    {
      id: "cast-3",
      name: "Sophia Rodriguez",
      role: "Actor",
      photo: "/placeholder.svg?height=40&width=40",
      featured: false,
    },
    {
      id: "cast-4",
      name: "David Johnson",
      role: "Director",
      photo: "/placeholder.svg?height=40&width=40",
      featured: false,
    },
  ],
  library: [
    {
      id: "lib-1",
      title: "The Adventure Begins",
      type: "Series",
      season: "Season 1",
      episode: "Episode 1",
      duration: "42 min",
      thumbnail: "/placeholder.svg?height=40&width=70",
    },
    {
      id: "lib-2",
      title: "Journey to the Unknown",
      type: "Movie",
      duration: "2h 15m",
      thumbnail: "/placeholder.svg?height=40&width=70",
    },
    {
      id: "lib-3",
      title: "The Revelation",
      type: "Series",
      season: "Season 2",
      episode: "Episode 5",
      duration: "45 min",
      thumbnail: "/placeholder.svg?height=40&width=70",
    },
    {
      id: "lib-4",
      title: "Star Travelers",
      type: "Movie",
      duration: "2h 30m",
      thumbnail: "/placeholder.svg?height=40&width=70",
    },
  ],
  billing: [
    { id: "bill-1", name: "John Smith", plan: "Premium", status: "active", amount: "$14.99" },
    { id: "bill-2", name: "Sarah Johnson", plan: "Basic", status: "active", amount: "$7.99" },
    { id: "bill-3", name: "Michael Brown", plan: "Family", status: "active", amount: "$19.99" },
  ],
  categories: [
    { id: "cat-1", name: "Action", itemCount: 24 },
    { id: "cat-2", name: "Drama", itemCount: 32 },
    { id: "cat-3", name: "Comedy", itemCount: 18 },
    { id: "cat-4", name: "Sci-Fi", itemCount: 15 },
  ],
  analytics: [
    { id: "ana-1", name: "Monthly Views Report", type: "report" },
    { id: "ana-2", name: "User Engagement Metrics", type: "dashboard" },
    { id: "ana-3", name: "Content Performance", type: "metrics" },
  ],
}

type SearchResult = {
  cast: typeof mockSearchData.cast
  library: typeof mockSearchData.library
  billing: typeof mockSearchData.billing
  categories: typeof mockSearchData.categories
  analytics: typeof mockSearchData.analytics
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult>({
    cast: [],
    library: [],
    billing: [],
    categories: [],
    analytics: [],
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Function to handle search
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults({
        cast: [],
        library: [],
        billing: [],
        categories: [],
        analytics: [],
      })
      return
    }

    setIsLoading(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      const query = searchQuery.toLowerCase()

      // Filter mock data based on search query
      const filteredResults = {
        cast: mockSearchData.cast.filter(
          (item) => item.name.toLowerCase().includes(query) || item.role.toLowerCase().includes(query),
        ),
        library: mockSearchData.library.filter(
          (item) => item.title.toLowerCase().includes(query) || item.type.toLowerCase().includes(query),
        ),
        billing: mockSearchData.billing.filter(
          (item) => item.name.toLowerCase().includes(query) || item.plan.toLowerCase().includes(query),
        ),
        categories: mockSearchData.categories.filter((item) => item.name.toLowerCase().includes(query)),
        analytics: mockSearchData.analytics.filter(
          (item) => item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query),
        ),
      }

      setSearchResults(filteredResults)
      setIsLoading(false)

      // Set active section to the first non-empty section
      const firstNonEmptySection = Object.entries(filteredResults).find(([_, items]) => items.length > 0)?.[0] || null
      setActiveSection(firstNonEmptySection)
      setActiveIndex(0)
    }, 300) // Simulate network delay
  }, [])

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value)
    handleSearch(value)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle navigation to result
  const navigateToResult = (section: string, id: string) => {
    setOpen(false)

    // In a real app, you would navigate to the appropriate page
    // This is a simplified example
    switch (section) {
      case "cast":
        router.push(`/cast?id=${id}`)
        break
      case "library":
        router.push(`/library?id=${id}`)
        break
      case "billing":
        router.push(`/billing?id=${id}`)
        break
      case "categories":
        router.push(`/categories?id=${id}`)
        break
      case "analytics":
        router.push(`/analytics?id=${id}`)
        break
      default:
        break
    }
  }

  // Calculate total results
  const totalResults = Object.values(searchResults).reduce((sum, items) => sum + items.length, 0)

  // Render search result item based on section
  const renderSearchResultItem = (section: string, item: any, index: number) => {
    switch (section) {
      case "cast":
        return (
          <CommandItem
            key={item.id}
            value={`cast-${item.id}`}
            onSelect={() => navigateToResult("cast", item.id)}
            className="py-2"
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.photo} alt={item.name} />
                <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{item.name}</p>
                  {item.featured && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CommandItem>
        )

      case "library":
        return (
          <CommandItem
            key={item.id}
            value={`library-${item.id}`}
            onSelect={() => navigateToResult("library", item.id)}
            className="py-2"
          >
            <div className="flex items-center gap-2 w-full">
              <div className="relative h-8 w-14 overflow-hidden rounded-sm flex-shrink-0">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{item.type}</span>
                  {item.season && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{item.season}</span>
                    </>
                  )}
                  {item.episode && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{item.episode}</span>
                    </>
                  )}
                  <span className="mx-1">•</span>
                  <span>{item.duration}</span>
                </div>
              </div>
              <Film className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CommandItem>
        )

      case "billing":
        return (
          <CommandItem key={item.id} value={`billing-${item.id}`} onSelect={() => navigateToResult("billing", item.id)}>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{item.plan} Plan</span>
                  <span className="mx-1">•</span>
                  <span>{item.amount}/month</span>
                  <span className="mx-1">•</span>
                  <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
              <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CommandItem>
        )

      case "categories":
        return (
          <CommandItem
            key={item.id}
            value={`categories-${item.id}`}
            onSelect={() => navigateToResult("categories", item.id)}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.itemCount} items</p>
              </div>
              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CommandItem>
        )

      case "analytics":
        return (
          <CommandItem
            key={item.id}
            value={`analytics-${item.id}`}
            onSelect={() => navigateToResult("analytics", item.id)}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>
              <BarChart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CommandItem>
        )

      default:
        return null
    }
  }

  // Get section icon
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "cast":
        return <User className="h-4 w-4" />
      case "library":
        return <Film className="h-4 w-4" />
      case "billing":
        return <CreditCard className="h-4 w-4" />
      case "categories":
        return <Tag className="h-4 w-4" />
      case "analytics":
        return <BarChart className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  // Get section name
  const getSectionName = (section: string) => {
    switch (section) {
      case "cast":
        return "Cast Members"
      case "library":
        return "Content Library"
      case "billing":
        return "Billing & Subscriptions"
      case "categories":
        return "Categories"
      case "analytics":
        return "Analytics"
      default:
        return section
    }
  }

  // Render quick links
  const renderQuickLinks = () => {
    const quickLinks = [
      { name: "Dashboard", icon: <FileText className="h-4 w-4" />, path: "/dashboard" },
      { name: "Content Library", icon: <Film className="h-4 w-4" />, path: "/library" },
      { name: "Cast Management", icon: <User className="h-4 w-4" />, path: "/cast" },
      { name: "Analytics", icon: <BarChart className="h-4 w-4" />, path: "/analytics" },
      { name: "Settings", icon: <Settings className="h-4 w-4" />, path: "/settings" },
    ]

    return (
      <CommandGroup heading="Quick Navigation">
        {quickLinks.map((link) => (
          <CommandItem
            key={link.path}
            value={`quicklink-${link.path}`}
            onSelect={() => {
              setOpen(false)
              router.push(link.path)
            }}
          >
            <div className="flex items-center gap-2">
              {link.icon}
              <span>{link.name}</span>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </CommandItem>
        ))}
      </CommandGroup>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search content...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            ref={inputRef}
            placeholder="Search across your entire platform..."
            value={query}
            onValueChange={handleInputChange}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {query && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleInputChange("")}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <CommandList>
          {query === "" ? (
            renderQuickLinks()
          ) : isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          ) : totalResults === 0 ? (
            <CommandEmpty>
              <div className="py-6 text-center">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for something else</p>
              </div>
            </CommandEmpty>
          ) : (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                {totalResults} result{totalResults !== 1 ? "s" : ""} found for "{query}"
              </div>

              {/* Cast Results */}
              {searchResults.cast.length > 0 && (
                <CommandGroup heading="Cast Members">
                  {searchResults.cast.map((item, index) => renderSearchResultItem("cast", item, index))}
                  {searchResults.cast.length > 3 && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        router.push(`/cast?search=${encodeURIComponent(query)}`)
                      }}
                      className="justify-center text-sm text-muted-foreground"
                    >
                      View all {searchResults.cast.length} cast results
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {/* Library Results */}
              {searchResults.library.length > 0 && (
                <CommandGroup heading="Content Library">
                  {searchResults.library.map((item, index) => renderSearchResultItem("library", item, index))}
                  {searchResults.library.length > 3 && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        router.push(`/library?search=${encodeURIComponent(query)}`)
                      }}
                      className="justify-center text-sm text-muted-foreground"
                    >
                      View all {searchResults.library.length} content results
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {/* Billing Results */}
              {searchResults.billing.length > 0 && (
                <CommandGroup heading="Billing & Subscriptions">
                  {searchResults.billing.map((item, index) => renderSearchResultItem("billing", item, index))}
                  {searchResults.billing.length > 3 && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        router.push(`/billing?search=${encodeURIComponent(query)}`)
                      }}
                      className="justify-center text-sm text-muted-foreground"
                    >
                      View all {searchResults.billing.length} billing results
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              {/* Categories Results */}
              {searchResults.categories.length > 0 && (
                <CommandGroup heading="Categories">
                  {searchResults.categories.map((item, index) => renderSearchResultItem("categories", item, index))}
                </CommandGroup>
              )}

              {/* Analytics Results */}
              {searchResults.analytics.length > 0 && (
                <CommandGroup heading="Analytics">
                  {searchResults.analytics.map((item, index) => renderSearchResultItem("analytics", item, index))}
                </CommandGroup>
              )}

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                  }}
                  className="justify-center"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>Advanced Search for "{query}"</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div>
              <span className="hidden sm:inline-block">Press </span>
              <kbd className="mx-1 inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span className="hidden sm:inline-block"> to search anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Navigate</span>
              <div className="flex gap-1">
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium">
                  ↑
                </kbd>
                <kbd className="inline-flex h-5 w-5 items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium">
                  ↓
                </kbd>
              </div>
              <span>Select</span>
              <kbd className="inline-flex h-5 w-8 items-center justify-center rounded border bg-muted font-mono text-[10px] font-medium">
                ↵
              </kbd>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
