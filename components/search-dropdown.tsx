"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Play, Search, Star, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SearchResult = {
  id: string;
  title: string;
  type: "drama" | "movie" | "actor" | "genre";
  image?: string;
  year?: string;
  rating?: number;
  description?: string;
};

type RecentSearch = {
  id: string;
  query: string;
  timestamp: number;
};

type PopularContent = {
  id: string;
  title: string;
  type: "drama" | "movie";
  image: string;
  trending: boolean;
};

export function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Load popular content on mount
  useEffect(() => {
    const fetchPopularContent = async () => {
      try {
        const response = await axios.get("/api/popular-content?limit=5");
        if (response.data.results) {
          setPopularContent(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching popular content:", error);
      }
    };

    fetchPopularContent();
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        toast.error("Failed to load recent searches");
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input changes
  const handleInputChange = (value: string) => {
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        performSearch(value.trim());
      } else {
        setSearchResults([]);
        setIsLoading(false);
      }
    }, 300);
  };

  // Perform search
  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      if (response.data.results) {
        setSearchResults(response.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: searchQuery.trim(),
      timestamp: Date.now(),
    };

    const updatedRecent = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== searchQuery.trim()),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    // Close dropdown and clear input
    setIsOpen(false);
    setQuery("");

    router.push(`/search?q=${searchQuery}`);

    // Navigate to search results page (you would implement this)
    console.log("Searching for:", searchQuery);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Remove individual recent search
  const removeRecentSearch = (id: string) => {
    const updated = recentSearches.filter((search) => search.id !== id);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "drama":
      case "movie":
        return <Play className="h-4 w-4" />;
      case "actor":
        return <Star className="h-4 w-4" />;
      case "genre":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "drama":
        return "text-blue-400";
      case "movie":
        return "text-purple-400";
      case "actor":
        return "text-yellow-400";
      case "genre":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  // Function to highlight search query in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-violet-200 dark:bg-violet-800 text-white px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search movies, dramas, actresses..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(query);
              } else if (e.key === "Escape") {
                clearSearch();
              }
            }}
            className="w-[250px] md:w-[350px] pl-10 pr-10 backdrop-blur-sm border-muted/50 focus:border-primary/50"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted/50"
            >
              <X className="size-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="w-full max-h-[70vh] overflow-hidden bg-background/95 backdrop-blur-md border-muted/50 shadow-xl">
              <div className="max-h-[70vh] overflow-y-auto">
                {/* Search Results */}
                {query && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {isLoading ? "Searching..." : `Results for "${query}"`}
                      </h3>
                      {searchResults.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {searchResults.length} found
                        </span>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 animate-pulse"
                          >
                            <div className="w-12 h-12 bg-muted rounded-md" />
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            href={
                              result.type === "actor"
                                ? `/actor/${result.id}`
                                : result.type === "genre"
                                  ? `/genre/${result.id}`
                                  : `/title/${result.id}`
                            }
                            onClick={() => handleSearch(result.title)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            {result.image ? (
                              <Image
                                src={result.image || "/placeholder.svg"}
                                alt={result.title}
                                height={48}
                                width={48}
                                className="w-12 h-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                <div className={getTypeColor(result.type)}>
                                  {getTypeIcon(result.type)}
                                </div>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium truncate">
                                  {highlightText(result.title, query)}
                                </h4>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full bg-muted/50 ${getTypeColor(
                                    result.type
                                  )}`}
                                >
                                  {result.type}
                                </span>
                                {result.year && (
                                  <span className="text-xs text-muted-foreground">
                                    ({result.year})
                                  </span>
                                )}
                              </div>
                              {result.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {highlightText(result.description, query)}
                                </p>
                              )}
                              {result.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-muted-foreground">
                                    {result.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No results found for &quot;{query}&quot;
                        </p>
                        <p className="text-xs mt-1">
                          Try different keywords or check spelling
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-4 border-b border-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between group"
                        >
                          <button
                            onClick={() => handleSearch(search.query)}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors flex-1 text-left"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{search.query}</span>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRecentSearch(search.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Content */}
                {!query && (
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Popular & Trending
                    </h3>
                    <div className="space-y-1">
                      {popularContent.map((content) => (
                        <Link
                          key={content.id}
                          href={`/title/${content.id}`}
                          onClick={() => handleSearch(content.title)}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Image
                            src={content.image || "/placeholder.svg"}
                            alt={content.title}
                            height={40}
                            width={40}
                            className="size-10 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">
                                {highlightText(content.title, query)}
                              </h4>
                              {content.trending && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                  Trending
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {content.type}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
