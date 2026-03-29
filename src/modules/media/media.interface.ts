export interface IMediaQuery {
  search?: string | undefined;
  genre?: string | undefined;
  platform?: string | undefined;
  year?: string | undefined;
  sort?: string | undefined;
  page?: string | undefined;
  limit?: string | undefined;
  minRating?: string | undefined;
  maxRating?: string | undefined;
  /** If true, only titles flagged for Editor’s picks */
  editorsPick?: string | undefined;
}

export interface ICreateMediaPayload {
  title: string;
  synopsis: string;
  releaseYear: string | number;
  director: string;
  genres?: unknown;
  cast?: unknown;
  platforms?: unknown;
  pricingType?: string;
  editorsPick?: boolean;
  purchasePrice?: number | string | null;
  rentalPrice?: number | string | null;
  rentalDurationDays?: string | number;
  streamUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
}

export interface IUpdateMediaPayload {
  title?: string;
  synopsis?: string;
  releaseYear?: string | number;
  director?: string;
  genres?: unknown;
  cast?: unknown;
  platforms?: unknown;
  pricingType?: string;
  editorsPick?: boolean;
  purchasePrice?: number | string | null;
  rentalPrice?: number | string | null;
  rentalDurationDays?: string | number;
  streamUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
}
