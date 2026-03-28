import { prisma } from '../../lib/prisma.js';
// import { AppError } from '../../utils/http.js';
// import { parseInteger, parseStringArray } from '../../utils/parse.js';

export const getAllMedia = async (query: {
  search?: string;
  genre?: string;
  platform?: string;
  year?: string;
  sort?: string;
}) => {
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

export const getMediaById = async (id: string) => {
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

export const createMedia = async (body: {
  title: string;
  synopsis: string;
  releaseYear: string | number;
  director: string;
  genres?: unknown;
  cast?: unknown;
  platforms?: unknown;
  pricingType?: string;
  streamUrl?: string;
}) => {
  const { title, synopsis, releaseYear, director, pricingType = 'FREE', streamUrl } = body;

  if (!title || !synopsis || !releaseYear || !director) {
    throw new AppError('title, synopsis, releaseYear, and director are required', 422);
  }

  return prisma.media.create({
    data: {
      title,
      synopsis,
      releaseYear: parseInteger(releaseYear, 'releaseYear'),
      director,
      genres: parseStringArray(body.genres),
      cast: parseStringArray(body.cast),
      platforms: parseStringArray(body.platforms),
      pricingType: pricingType as 'FREE' | 'PREMIUM',
      streamUrl,
    },
  });
};

export const updateMedia = async (id: st