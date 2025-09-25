# Mobile Search Implementation

This document explains the mobile search functionality implemented for the iQnixTV application.

## Components Overview

### 1. MobileSearchBar (`components/mobile-search-bar.tsx`)
A full-screen mobile search modal with overlay design that provides:
- **Full-screen search experience** with backdrop blur
- **Real-time search** with debounced API calls
- **Recent searches** stored in localStorage
- **Popular content** suggestions when no query is entered
- **Search result highlighting** with query matching
- **Smooth animations** using Framer Motion
- **Touch-friendly interface** optimized for mobile devices

**Usage:**
```tsx
import { MobileSearchBar } from "@/components/mobile-search-bar";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <MobileSearchBar 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
    />
  );
}
```

### 2. MobileSearchInput (`components/mobile-search-input.tsx`)
A standalone mobile-optimized search input component that provides:
- **Large touch targets** (h-10) for better mobile interaction
- **Clear button** that appears when text is entered
- **Enter key support** for search submission
- **Customizable placeholder** and default values
- **Optional onSearch callback** for custom handling

**Usage:**
```tsx
import { MobileSearchInput } from "@/components/mobile-search-input";

function SearchPage() {
  return (
    <MobileSearchInput 
      placeholder="Search movies, dramas, actresses..."
      defaultValue={query}
      onSearch={(query) => console.log('Searching:', query)}
    />
  );
}
```

### 3. MobileSearchResults (`components/mobile-search-results.tsx`)
Mobile-optimized search results display with:
- **Grid layout** (2 columns) optimized for mobile screens
- **Card-based design** with hover effects
- **Image aspect ratio** (3:4) for consistent layout
- **Overlay play buttons** on hover
- **Type and rating badges** for quick identification
- **Truncated text** to prevent layout issues
- **Loading states** with skeleton animations

**Usage:**
```tsx
import { MobileSearchResults } from "@/components/mobile-search-results";

function SearchPage() {
  return (
    <MobileSearchResults
      query={query}
      episodeId={episodeId}
      seasonId={seasonId}
    />
  );
}
```

### 4. MobileSearchFAB (`components/mobile-search-fab.tsx`)
A floating action button for easy access to search:
- **Fixed positioning** (bottom-right corner)
- **Circular design** with shadow effects
- **Smooth animations** and hover states
- **Accessibility support** with screen reader labels

**Usage:**
```tsx
import { MobileSearchFAB } from "@/components/mobile-search-fab";

function Layout() {
  return (
    <div>
      {/* Your app content */}
      <MobileSearchFAB />
    </div>
  );
}
```

## Integration

### Updated SearchButton
The existing `SearchButton` component has been updated to use the mobile search modal on mobile devices:

```tsx
// components/search-button.tsx
export const SearchButton = () => {
  const isMobile = useMobile();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div>
      {isMobile ? (
        <>
          <Button onClick={() => setIsMobileSearchOpen(true)}>
            <Search className="size-5" />
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
```

### Updated Search Page
The search page now provides different experiences for mobile and desktop:

```tsx
// app/(routes)/(client)/search/page.tsx
<div className="md:hidden">
  <MobileSearchInput defaultValue={query} />
  <MobileSearchResults query={query} episodeId={episodeId} seasonId={seasonId} />
</div>
<div className="hidden md:block">
  <SearchResults query={query} episodeId={episodeId} seasonId={seasonId} />
</div>
```

## Features

### Search Functionality
- **Debounced search** (300ms delay) to prevent excessive API calls
- **Real-time results** with loading states
- **Error handling** with user-friendly messages
- **Recent searches** persistence in localStorage
- **Search result highlighting** with query matching

### Mobile Optimizations
- **Touch-friendly interface** with large tap targets
- **Responsive design** that adapts to different screen sizes
- **Smooth animations** using Framer Motion
- **Keyboard support** (Enter to search, Escape to close)
- **Accessibility** with proper ARIA labels and screen reader support

### Visual Design
- **Modern UI** with backdrop blur and shadows
- **Consistent spacing** and typography
- **Loading states** with skeleton animations
- **Empty states** with helpful messaging
- **Type indicators** with color-coded badges

## API Integration

The mobile search components integrate with the existing search API:

```typescript
// Search API endpoint
GET /api/search?q={query}&limit={limit}

// Response format
{
  results: [
    {
      id: string;
      title: string;
      type: "drama" | "movie" | "actor" | "genre";
      image?: string;
      year?: string;
      rating?: number;
      description?: string;
    }
  ]
}
```

## Styling

The components use Tailwind CSS classes and follow the existing design system:
- **Responsive breakpoints**: `md:` prefix for desktop styles
- **Color scheme**: Uses existing theme colors and CSS variables
- **Spacing**: Consistent with the app's spacing scale
- **Typography**: Matches the app's font sizes and weights

## Accessibility

All components include proper accessibility features:
- **Screen reader support** with `sr-only` labels
- **Keyboard navigation** support
- **Focus management** for modal interactions
- **ARIA attributes** for better screen reader experience
- **High contrast** support through theme variables

## Performance

The mobile search implementation includes several performance optimizations:
- **Debounced search** to reduce API calls
- **Image optimization** with Next.js Image component
- **Lazy loading** for search results
- **Efficient state management** with minimal re-renders
- **Memory cleanup** for event listeners and timeouts
