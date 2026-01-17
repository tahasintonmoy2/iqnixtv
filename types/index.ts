export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: string;
}

export interface Series {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  duration: string;
  contentWarnings: ContentWarningsType;
  isPublished: boolean;
  isAvailableRegions: boolean;
  viewsCount: number;
  contentRatingId: string;
  contentRating: ContentRating;
  ageRatingId: string;
  ageRating: AgeRating;
  releaseDate: Date;
  isNewRelease: boolean;
  isPopular: boolean;
  thumbnailImageUrl: string;
  bannerImageUrl: string;
  region: string;
  starringCastDescription: string;
  castDescription: string;
  isPaid: boolean;
  seasons: Season[];
  episodes: Episode[];
  playlistId?: string;
  playlist: Playlist;
  watchHistoryId: string;
  playlistContent: PlaylistContent;
  watchHistory: WatchHistory[];
  seriesBanners: SeriesBanner[];
  trailers: Trailers[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentRating {
  id: string;
  name: string;
  rating: number;
}

export interface Trailers {
  id: string;
  name: string;
  type: TrailersStatus;
  isPublished: boolean;
  videoUrl: string;
  thumbnailImageUrl: string;
  seriesId: string;
  series: Series;
  muxData: MuxData;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeriesBanner {
  id: string;
  name: string;
  description: string | null;
  bannerImageUrl: string | null;
  isPublished: boolean | null;
  seriesId: string | null;
  series: Series;
  createdAt: Date;
}

export interface MuxData {
  id: String;
  assetId: String;
  playbackId: String;
  episodeId: String;
  episode: Episode;
  trailerId: String;
  trailer: Trailers;

  subtitles: SubtitleTrack;
  audioTracks: AudioTrack;
}

export interface AgeRating {
  id: string;
  name: string;
  episodes: Episode;
  series: Series;
}

export interface Season {
  id: string;
  name: string;
  description: string | null;
  seriesId: string;
  releaseDate: Date;
  seasonNumber: string;
  thumbnailImageUrl: string | null;
  trailerVideoUrl: string | null;
  isPublished: boolean;
  regions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Episode {
  id: string;
  name: string;
  episodeNumber: string;
  description?: string;
  duration?: string;
  isPublished: boolean;
  isFree: boolean;
  releaseDate: Date;
  videoUrl: string;
  seasonId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  lastUpdatedAt: Date;
  userId: string;
  user: User;
  contents: PlaylistContent;
  series: Series;

  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistContent {
  id: string;
  playlistId: string;
  seriesId: string;
  series: Series;
  playlist: Playlist;
  userId: string;
  user: User;
}

export interface WatchHistory {
  id: String;
  userId: String;
  episodeId: String;
  seriesId: String;
  currentTime: number; // Current position in seconds
  duration: number; // Video duration in seconds
  progressPercent: number; // Progress percentage (0-100)
  isCompleted: Boolean;

  lastWatchedAt: Date;
  firstWatchedAt: Date;
  user: User;
  episode: Episode;
  series: Series;

  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalApiRespnose<T> {
  success: true;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

enum TrailersStatus {
  TRAILER,
  TEASER,
  CLIP,
}

enum ContentRequestStatus {
  UNDER_REVIEW,
  REJECTED,
  APPROVED,
  IN_DUBBING,
  COMPLETED,
}

enum SubtitleStatus {
  PENDING,
  PROCESSING,
  FAILED,
  READY,
}

enum SeriesBannerStatus {
  ACTIVE,
  PAUSED,
  SCHEDULED,
}

enum SubscriptionStatus {
  ACTIVE,
  CANCELED,
  PAST_DUE,
  UNPAID,
  INCOMPLETE,
  INCOMPLETE_EXPIRED,
  TRIALING,
}

enum SubscriptionTier {
  FREE,
  PREMIUM,
  MAX,
}

enum UploadStatus {
  PROCESSING,
  COMPLETED,
  STORED,
}

enum ContentType {
  SERIES,
  MOVIE,
  DOCUMENTARY,
  VARIETY_SHOWS,
}

enum ContentWarningsType {
  VIOLENCE,
  STRONG_LANGUAGE,
  SEXUAL_CONTENT,
  ALCOHOL_USE,
  STRONG_SLANG,
}
