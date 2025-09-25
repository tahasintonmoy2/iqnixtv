# New Release Functionality

This document explains how the new release functionality works in the application and how to use it.

## Overview

The new release functionality automatically determines if content should be marked as "new" based on its creation date or release date. This replaces the static `isNewRelease` boolean field with dynamic logic that considers content "new" for a configurable number of days.

## Key Components

### 1. Utility Functions (`lib/new-release-utils.ts`)

The main utility functions for determining new releases:

- `isNewRelease(createdAt, releaseDate?, config?)` - Determines if content is new
- `getDaysSinceCreation(createdAt)` - Calculates days since creation
- `getTimeAgoString(createdAt)` - Returns human-readable time ago string

### 2. Configuration (`config/new-release.ts`)

Configuration for new release detection:

```typescript
export const NEW_RELEASE_CONFIG: NewReleaseConfig = {
  newReleaseDays: 30, // Content is considered "new" for 30 days
  useCreatedAt: true, // Use creation date instead of release date
  showTimeAgo: false, // Don't show "X days ago" by default
};
```

### 3. New Release Badge Component (`components/new-release-badge.tsx`)

A reusable component for displaying new release badges:

```tsx
<NewReleaseBadge
  createdAt={item.createdAt}
  releaseDate={item.releaseDate}
  isNewRelease={item.isNewRelease}
  showTimeAgo={false}
/>
```

## How It Works

### Dynamic Detection

The system now automatically determines if content is new by:

1. **Using Creation Date**: By default, content is considered "new" if it was created within the last 30 days
2. **Fallback to Release Date**: If `useCreatedAt` is false, it uses the `releaseDate` field
3. **Static Override**: The static `isNewRelease` field still works as an override

### Configuration Options

You can customize the behavior through environment variables:

- `NEW_RELEASE_DAYS` - Number of days to consider content as new (default: 30)
- `USE_CREATED_AT` - Whether to use creation date (default: true)
- `SHOW_TIME_AGO` - Whether to show "X days ago" text (default: false)

## Usage Examples

### Basic Usage

```tsx
import { isNewRelease } from "@/lib/new-release-utils";

// Check if content is new
const isNew = isNewRelease(item.createdAt, item.releaseDate);

// With custom configuration
const isNew = isNewRelease(item.createdAt, item.releaseDate, {
  newReleaseDays: 14,
  useCreatedAt: true
});
```

### Using the Badge Component

```tsx
import { NewReleaseBadge } from "@/components/new-release-badge";

// Basic usage
<NewReleaseBadge
  createdAt={item.createdAt}
  releaseDate={item.releaseDate}
/>

// With time ago display
<NewReleaseBadge
  createdAt={item.createdAt}
  releaseDate={item.releaseDate}
  showTimeAgo={true}
/>

// With static override
<NewReleaseBadge
  createdAt={item.createdAt}
  releaseDate={item.releaseDate}
  isNewRelease={true} // Always show as new
/>
```

### API Integration

The API routes now automatically include the dynamic new release calculation:

```typescript
// In API responses
{
  id: "series-id",
  title: "Series Title",
  isNewRelease: true, // Dynamically calculated
  createdAt: "2024-01-01T00:00:00Z",
  releaseDate: "2024-01-15T00:00:00Z"
}
```

## Migration from Static Field

The system is backward compatible:

1. **Existing Data**: Content with `isNewRelease: true` will continue to show as new
2. **New Content**: Content without the static flag will be evaluated dynamically
3. **Combined Logic**: The system uses `OR` logic: `item.isNewRelease || isNewRelease(item.createdAt, item.releaseDate)`

## Customization

### Changing the Time Threshold

To change how long content is considered "new":

1. **Environment Variable**: Set `NEW_RELEASE_DAYS=14` for 14 days
2. **Code Configuration**: Modify `config/new-release.ts`
3. **Per-Request**: Pass custom config to `isNewRelease()` function

### Using Release Date Instead of Creation Date

To use the release date instead of creation date:

1. **Environment Variable**: Set `USE_CREATED_AT=false`
2. **Code Configuration**: Set `useCreatedAt: false` in config
3. **Per-Request**: Pass `{ useCreatedAt: false }` to `isNewRelease()`

## Performance Considerations

- The new release calculation is lightweight and runs on each request
- Consider caching results for high-traffic applications
- The calculation is done in JavaScript, so it's fast and doesn't require database queries

## Future Enhancements

Potential improvements:

1. **Caching**: Cache new release status to avoid recalculation
2. **Batch Updates**: Update the static `isNewRelease` field periodically
3. **Analytics**: Track which new releases get the most engagement
4. **A/B Testing**: Test different time thresholds for optimal user engagement
