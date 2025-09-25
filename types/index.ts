export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: string;
}

export interface Season {
  id: string,
  name: string,
  seasonNumber: string,
  description?: string,
  releaseDate: Date,
  thumbnailImageUrl: string,
  trailerVideoUrl: string,
  isPublished: boolean
}

export interface Episode {
  id: string,
  name: string,
  episodeNumber: string,
  description?: string,
  isPublished: boolean,
  isFree: boolean
  releaseDate: Date,
  videoUrl: string,
  seasonId?: string
}

export interface ExternalApiRespnose<T> {
  success: true,
  data: T,
  message?: string,
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean,
  data: T[];
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
  message?: string
}

export interface ApiError {
  success: false,
  error: string,
  statusCode: number
}