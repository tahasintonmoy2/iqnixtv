# Popular Dramas Functionality

This document explains how the popular dramas functionality works in the application and how to use it.

## Overview

The popular dramas functionality automatically determines if content should be marked as "popular" based on the `isPopular` field, views count, and content rating. This provides both static and dynamic ways to identify popular content.

## Key Components

### 1. Utility Functions (`lib/popular-content-utils.ts`)

The main utility functions for determining popular content:

- `isPopularContent(isPopular, viewsCount?, rating?, config?)` - Determines if content is popular
- `getPopularityScore(viewsCount?, rating?)` - Calculates a popularity score (0-100)
- `getPopularityLevel(score)` - Returns human-readable popularity level

### 2. Configuration (`config/popular-content.ts`)

Configuration for popular content detection:

```typescript
export const POPULAR_CONTENT_CONFIG: PopularContentConfig = {
  minViewsCount: 1000, // Minimum views to be considered popular
  minRating: 4.0, // Minimum rating to be considered popular
  useStaticField: true, // Use the static isPopular field
  considerViews: true, // Consider views count in popularity calculation
  considerRating: true, // Consider rating in popularity calculation
};
```

### 3. Popular Badge Component (`components/popular-badge.tsx`)

A reusable component for displaying popular content badges:

```tsx
<PopularBadge
  isPopular={item.isPopular}
  viewsCount={item.viewsCount}
  rating={item.contentRating?.rating}
  showLevel={false}
/>
```

## How It Works

### Static vs Dynamic Detection

The system determines if content is popular through multiple methods:

1. **Static Field**: If `isPopular: true` in the database, content is always marked as popular
2. **Dynamic Criteria**: If static field is false/null, content is evaluated based on:
   - Views count (minimum threshold)
   - Content rating (minimum threshold)
   - Combined popularity score

### Popularity Scoring

The system calculates a popularity score (0-100) based on:
- **Views Count**: Normalized to 0-100 scale (assuming max ~100k views)
- **Rating**: Converted from 0-5 scale to 0-100 scale
- **Weighted Average**: 70% views + 30% rating

### Popularity Levels

Based on the score, content is categorized as:
- **Very Popular** (80-100): High engagement content
- **Popular** (60-79): Well-received content
- **Trending** (40-59): Growing content
- **Rising** (20-39): Emerging content
- **New** (0-19): Recently added content

## Usage Examples

### Basic Usage

```tsx
import { isPopularContent } from "@/lib/popular-content-utils";

// Check if content is popular
const isPopular = isPopularContent(item.isPopular, item.viewsCount, item.rating);

// With custom configuration
const isPopular = isPopularContent(item.isPopular, item.viewsCount, item.rating, {
  minViewsCount: 500,
  minRating: 3.5,
  useStaticField: true
});
```

### Using the Badge Component

```tsx
import { PopularBadge } from "@/components/popular-badge";

// Basic usage
<PopularBadge
  isPopular={item.isPopular}
  viewsCount={item.viewsCount}
  rating={item.contentRating?.rating}
/>

// With popularity level display
<PopularBadge
  isPopular={item.isPopular}
  viewsCount={item.viewsCount}
  rating={item.contentRating?.rating}
  showLevel={true}
/>

// Static override
<PopularBadge
  isPopular={true} // Always show as popular
  viewsCount={item.viewsCount}
  rating={item.contentRating?.rating}
/>
```

### API Integration

The API routes now include popular content filtering:

```typescript
// GET /api/series/by-category?category=popular
{
  id: "series-id",
  title: "Series Title",
  isPopular: true, // Dynamically calculated
  viewsCount: 5000,
  contentRating: 4.5
}
```

## Configuration Options

You can customize the behavior through environment variables:

- `MIN_VIEWS_FOR_POPULAR` - Minimum views to consider popular (default: 1000)
- `MIN_RATING_FOR_POPULAR` - Minimum rating to consider popular (default: 4.0)
- `USE_STATIC_POPULAR_FIELD` - Whether to use static isPopular field (default: true)
- `CONSIDER_VIEWS_FOR_POPULAR` - Whether to consider views count (default: true)
- `CONSIDER_RATING_FOR_POPULAR` - Whether to consider rating (default: true)

## Home Page Integration

The home page now includes a "Popular Dramas" section that:

1. **Filters Content**: Shows only content marked as popular
2. **Dynamic Calculation**: Uses both static and dynamic criteria
3. **Visual Indicators**: Displays "HOT" badges for popular content
4. **Responsive Layout**: Uses the same CategoryRow component

```tsx
// In the home page
<CategoryRow
  content={popularContent}
  title="Popular Dramas"
  contentGenre={genreNames}
/>
```

## Database Schema

The `isPopular` field in the Series model:

```prisma
model Series {
  // ... other fields
  isPopular Boolean? @default(false)
  viewsCount Int? @default(0)
  contentRating ContentRating? @relation(fields: [contentRatingId], references: [id])
  // ... other fields
}
```

## Migration and Backward Compatibility

The system is fully backward compatible:

1. **Existing Data**: Content with `isPopular: true` will continue to show as popular
2. **New Content**: Content without the static flag will be evaluated dynamically
3. **Combined Logic**: The system uses OR logic: `item.isPopular || isPopularContent(...)`

## Performance Considerations

- Popular content calculation is lightweight and runs on each request
- Consider caching results for high-traffic applications
- The calculation is done in JavaScript, so it's fast and doesn't require additional database queries

## Future Enhancements

Potential improvements:

1. **Caching**: Cache popularity scores to avoid recalculation
2. **Analytics**: Track which popular content gets the most engagement
3. **A/B Testing**: Test different popularity thresholds
4. **Time-based Popularity**: Consider content age in popularity calculation
5. **User Behavior**: Include user interaction data (likes, shares, etc.)

## Examples of Popular Content

Content is considered popular if it meets any of these criteria:

1. **Static Flag**: `isPopular: true` in database
2. **High Views**: 1000+ views AND 4.0+ rating
3. **High Rating**: 4.5+ rating regardless of views
4. **Combined Score**: 60+ popularity score

This flexible system ensures that both manually curated popular content and organically popular content are properly displayed to users.
