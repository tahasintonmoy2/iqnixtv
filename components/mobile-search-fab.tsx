"use client";

import { MobileSearchBar } from "@/components/mobile-search-bar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export function MobileSearchFAB() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsSearchOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Search className="h-6 w-6" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Search Modal */}
      <MobileSearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
