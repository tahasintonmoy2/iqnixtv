"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Clock, Play, Search, Star, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

interface MobileSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchBar({ isOpen, onClose }: MobileSearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load popular content on mount
  useEffect(() => {
    const fetchPopularContent = async () => {
      try {
        const response = await axios.get("/api/popular-content?limit=8");
        if (response.data.results) {
          setPopularContent(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching popular content:", error);
      }
    };

    if (isOpen) {
      fetchPopularContent();
    }
  }, [isOpen]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
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
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=15`
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

    // Close modal and clear input
    onClose();
    setQuery("");

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search movies, dramas, actresses..."
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(query);
                    } else if (e.key === "Escape") {
                      onClose();
                    }
                  }}
                  className="pl-10 pr-10 h-10"
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

            {/* Content */}
            <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
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
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 animate-pulse"
                        >
                          <div className="w-16 h-16 bg-muted rounded-md" />
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
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
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {result.image ? (
                            <Image
                              src={result.image || "/placeholder.svg"}
                              alt={result.title}
                              height={64}
                              width={64}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                              <div className={getTypeColor(result.type)}>
                                {getTypeIcon(result.type)}
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate text-sm">
                                {highlightText(result.title, query)}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full bg-muted/50 ${getTypeColor(
                                  result.type
                                )}`}
                              >
                                {result.type}
                              </span>
                            </div>
                            {result.year && (
                              <p className="text-xs text-muted-foreground mb-1">
                                {result.year}
                              </p>
                            )}
                            {result.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
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
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors flex-1 text-left"
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
                  <div className="grid grid-cols-2 gap-3">
                    {popularContent.map((content) => (
                      <Link
                        key={content.id}
                        href={`/title/${content.id}`}
                        onClick={() => handleSearch(content.title)}
                        className="flex flex-col gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative">
                          <Image
                            src={content.image || "/placeholder.svg"}
                            alt={content.title}
                            height={120}
                            width={120}
                            className="w-full aspect-[3/4] rounded-md object-cover"
                          />
                          {content.trending && (
                            <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full bg-red-500/90 text-white">
                              Trending
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-xs line-clamp-2">
                            {content.title}
                          </h4>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {content.type}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
