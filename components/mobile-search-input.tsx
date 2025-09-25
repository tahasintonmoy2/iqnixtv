"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MobileSearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export function MobileSearchInput({ 
  placeholder = "Search movies, dramas, actresses...",
  className = "",
  onSearch,
  defaultValue = ""
}: MobileSearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(query);
          }
        }}
        className="pl-10 pr-10 h-10 text-base"
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
  );
}
