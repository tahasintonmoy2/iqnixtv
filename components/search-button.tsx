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
      {isMobile ? (
        <>
          <Button 
            variant="ghost" 
            onClick={() => setIsMobileSearchOpen(true)}
            className="h-9 w-9 p-0"
          >
            <Search className="size-5" />
            <span className="sr-only">Search</span>
          </Button>
          <MobileSearchBar 
            isOpen={isMobileSearchOpen} 
            onClose={() => setIsMobileSearchOpen(false)} 
          />
        </>
      ) : (
        <SearchDropdown />
      )}
    </div>
  );
};
