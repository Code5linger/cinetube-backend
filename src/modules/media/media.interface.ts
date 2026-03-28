export interface IMediaQuery {
  search?: string | undefined;
  genre?: string | undefined;
  platform?: string | undefined;
  year?: string | undefined;
  sort?: string | undefined;
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
  streamUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
}
