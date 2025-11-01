"use client";

import { useMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";
import { useState } from "react";
import { MobileSearchBar } from "./mobile-search-bar";
import { SearchDropdown } from "./search-dropdown";
import { Button } from "./ui/button";

export const SearchButton = () => {
  const isMobile = useMobile();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div>
        <div className="mobile-search-bar">
          <Button 
            variant="ghost" 
            onClick={() => setIsMobileSearchOpen(true)}
            className="size-9 p-0"
          >
            <Search className="size-5" />
            <span className="sr-only">Search</span>
          </Button>
          <MobileSearchBar 
            isOpen={isMobileSearchOpen} 
            onClose={() => setIsMobileSearchOpen(false)} 
          />
        </div>
      <div className="search-bar">
        <SearchDropdown />
      </div>
    </div>
  );
};
