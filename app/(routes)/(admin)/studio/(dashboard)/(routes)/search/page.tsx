"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Film, User, CreditCard, Tag, BarChart, Search, Clock } from "lucide-react"

import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { AdvancedFilterDropdown } from "@/components/advanced-filter-dropdown"

// Import mock data from global-search.tsx
// In a real app, you would fetch this data from your API
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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState("all")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [searchResults, setSearchResults] = useState({
    cast: [] as typeof mockSearchData.cast,
    library: [] as typeof mockSearchData.library,
    billing: [] as typeof mockSearchData.billing,
    categories: [] as typeof mockSearchData.categories,
    analytics: [] as typeof mockSearchData.analytics,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Define filter options
  const filterOptions = [
    {
      id: "type",
      label: "Content Type",
      type: "select" as const,
      options: [
        { label: "Cast", value: "cast" },
        { label: "Library", value: "library" },
        { label: "Billing", value: "billing" },
        { label: "Categories", value: "categories" },
        { label: "Analytics", value: "analytics" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ]

  // Perform search when query changes
  useEffect(() => {
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
    }, 300) // Simulate network delay
  }, [searchQuery])

  // Handle search input change
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle filter change
  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters)
  }

  // Calculate total results
  const totalResults = Object.values(searchResults).reduce((sum, items) => sum + items.length, 0)

  // Get filtered results based on active tab
  const getFilteredResults = () => {
    if (activeTab === "all") {
      return searchResults
    }

    return {
      cast: activeTab === "cast" ? searchResults.cast : [],
      library: activeTab === "library" ? searchResults.library : [],
      billing: activeTab === "billing" ? searchResults.billing : [],
      categories: activeTab === "categories" ? searchResults.categories : [],
      analytics: activeTab === "analytics" ? searchResults.analytics : [],
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <>
      <DashboardHeader heading="Search Results" text={`Search results for "${searchQuery}"`}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </span>
        </div>
      </DashboardHeader>

      <div className="mb-6">
        <SearchFilterBar
          placeholder="Refine your search..."
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          className="w-full"
        >
          <AdvancedFilterDropdown
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </SearchFilterBar>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span>All Results</span>
            <Badge variant="secondary" className="ml-1">
              {totalResults}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cast" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Cast</span>
            <Badge variant="secondary" className="ml-1">
              {searchResults.cast.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-1">
            <Film className="h-4 w-4" />
            <span>Library</span>
            <Badge variant="secondary" className="ml-1">
              {searchResults.library.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
            <Badge variant="secondary" className="ml-1">
              {searchResults.billing.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>Categories</span>
            <Badge variant="secondary" className="ml-1">
              {searchResults.categories.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Search className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try searching for something else</p>
            </div>
          ) : (
            <>
              {/* Cast Results */}
              {filteredResults.cast.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Cast Members
                      </CardTitle>
                      <Badge variant="outline">{filteredResults.cast.length} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredResults.cast.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <Avatar className="h-10 w-10">
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Library Results */}
              {filteredResults.library.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Film className="h-5 w-5" />
                        Content Library
                      </CardTitle>
                      <Badge variant="outline">{filteredResults.library.length} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredResults.library.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="relative h-14 w-24 overflow-hidden rounded-md flex-shrink-0">
                            <img
                              src={item.thumbnail || "/placeholder.svg"}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              {item.season && <span>{item.season}</span>}
                              {item.episode && <span>{item.episode}</span>}
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>{item.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Results */}
              {filteredResults.billing.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Billing & Subscriptions
                      </CardTitle>
                      <Badge variant="outline">{filteredResults.billing.length} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredResults.billing.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <span>{item.plan} Plan</span>
                              <span>{item.amount}/month</span>
                              <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Categories Results */}
              {filteredResults.categories.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Categories
                      </CardTitle>
                      <Badge variant="outline">{filteredResults.categories.length} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {filteredResults.categories.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.itemCount} items</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analytics Results */}
              {filteredResults.analytics.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Analytics
                      </CardTitle>
                      <Badge variant="outline">{filteredResults.analytics.length} results</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredResults.analytics.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="cast">
          <Card>
            <CardHeader>
              <CardTitle>Cast Members</CardTitle>
              <CardDescription>Search results for cast members matching "{searchQuery}"</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredResults.cast.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <User className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No cast members found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.cast.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <Avatar className="h-10 w-10">
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>Search results for content matching "{searchQuery}"</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredResults.library.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Film className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No content found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.library.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="relative h-14 w-24 overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          {item.season && <span>{item.season}</span>}
                          {item.episode && <span>{item.episode}</span>}
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{item.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscriptions</CardTitle>
              <CardDescription>Search results for billing information matching "{searchQuery}"</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredResults.billing.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No billing information found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.billing.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span>{item.plan} Plan</span>
                          <span>{item.amount}/month</span>
                          <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Search results for categories matching "{searchQuery}"</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredResults.categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Tag className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No categories found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredResults.categories.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.itemCount} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
