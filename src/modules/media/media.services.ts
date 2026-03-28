import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
import { parseInteger, parseStringArray } from '../../utils/parse.js';
import {
  ICreateMediaPayload,
  IMediaQuery,
  IUpdateMediaPayload,
} from './media.interface.js';

const getAllMedia = async (query: IMediaQuery) => {
  const { search, genre, platform, year, sort = 'latest' } = query;

  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { director: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(genre ? { genres: { has: genre } } : {}),
    ...(platform ? { platforms: { has: platform } } : {}),
    ...(year ? { releaseYear: parseInteger(year, 'year') } : {}),
  };

  const orderBy =
    sort === 'top'
      ? { averageRating: 'desc' as const }
      : sort === 'title'
        ? { title: 'asc' as const }
        : { createdAt: 'desc' as const };

  return prisma.media.findMany({
    where,
    orderBy,
    include: { _count: { select: { reviews: true, watchlisted: true } } },
  });
};

const getMediaById = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { isPublished: true },
        include: {
          user: { select: { id: true, name: true, email: true } },
          likes: { select: { userId: true } },
          comments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!media) throw new AppError('Media not found', 404);
  return media;
};

const createMedia = async (payload: ICreateMediaPayload) => {
  const {
    title,
    synopsis,
    releaseYear,
    director,
    pricingType = 'FREE',
    streamUrl,
    posterUrl,
    thumbnailUrl,
    mediaType = 'MOVIE',
  } = payload;

  if (!title || !synopsis || !releaseYear || !director) {
    throw new AppError(
      'title, synopsis, releaseYear, and director are required',
      422,
    );
  }

  return prisma.media.create({
    data: {
      title,
      synopsis,
      releaseYear: parseInteger(releaseYear, 'releaseYear'),
      director,
      genres: parseStringArray(payload.genres),
      cast: parseStringArray(payload.cast),
      platforms: parseStringArray(payload.platforms),
      pricingType: pricingType as 'FREE' | 'PREMIUM',
      mediaType: mediaType as 'MOVIE' | 'SERIES',
      streamUrl: streamUrl ?? null,
      posterUrl: posterUrl ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
    },
  });
};

const updateMedia = async (id: string, payload: IUpdateMediaPayload) => {
  const data: Record<string, unknown> = {};

  for (const key of [
    'title',
    'synopsis',
    'director',
    'pricingType',
    'mediaType',
  ] as const) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }

  // nullable string fields
  for (const key of ['streamUrl', 'posterUrl', 'thumbnailUrl'] as const) {
    if (payload[key] !== undefined) data[key] = payload[key] ?? null;
  }

  if (payload.releaseYear !== undefined)
    data.releaseYear = parseInteger(payload.releaseYear, 'releaseYear');
  if (payload.genres !== undefined)
    data.genres = parseStringArray(payload.genres);
  if (payload.cast !== undefined) data.cast = parseStringArray(payload.cast);
  if (payload.platforms !== undefined)
    data.platforms = parseStringArray(payload.platforms);

  return prisma.media.update({ where: { id }, data });
};

const deleteMedia = async (id: string) => {
  await prisma.media.delete({ where: { id } });
};

export const MediaService = {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
};
