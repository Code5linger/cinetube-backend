import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
import {
  parseInteger,
  parseOptionalFloat,
  parsePagination,
  parseStringArray,
} from '../../utils/parse.js';
import {
  ICreateMediaPayload,
  IMediaQuery,
  IUpdateMediaPayload,
} from './media.interface.js';
import {
  PaymentStatus,
  PricingType,
  TitleAccessType,
} from '../../generated/prisma/index.js';

const userHasPremiumStreamAccess = async (
  userId: string,
  mediaId: string,
): Promise<boolean> => {
  const now = new Date();

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (sub?.status === PaymentStatus.PAID && sub.endDate && sub.endDate > now) {
    return true;
  }

  const purchase = await prisma.titleEntitlement.findFirst({
    where: {
      userId,
      mediaId,
      status: PaymentStatus.PAID,
      accessType: TitleAccessType.PURCHASE,
    },
  });
  if (purchase) return true;

  const rental = await prisma.titleEntitlement.findFirst({
    where: {
      userId,
      mediaId,
      status: PaymentStatus.PAID,
      accessType: TitleAccessType.RENTAL,
      expiresAt: { gt: now },
    },
  });

  return Boolean(rental);
};

const truthyQuery = (v: string | undefined): boolean =>
  v === '1' || v?.toLowerCase() === 'true';

const getAllMedia = async (query: IMediaQuery) => {
  const {
    search,
    genre,
    platform,
    year,
    sort = 'latest',
    page: pageRaw,
    limit: limitRaw,
    minRating,
    maxRating,
    editorsPick,
  } = query;

  const { page, limit, skip } = parsePagination(pageRaw, limitRaw);

  const minR = parseOptionalFloat(minRating, 'minRating');
  const maxR = parseOptionalFloat(maxRating, 'maxRating');
  if (minR !== undefined && maxR !== undefined && minR > maxR) {
    throw new AppError('minRating cannot exceed maxRating', 422);
  }

  const ratingFilter: { gte?: number; lte?: number } = {};
  if (minR !== undefined) ratingFilter.gte = minR;
  if (maxR !== undefined) ratingFilter.lte = maxR;

  const whereClause = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { director: { contains: search, mode: 'insensitive' as const } },
            { cast: { has: search } },
            { platforms: { has: search } },
          ],
        }
      : {}),
    ...(genre ? { genres: { has: genre } } : {}),
    ...(platform ? { platforms: { has: platform } } : {}),
    ...(year ? { releaseYear: parseInteger(year, 'year') } : {}),
    ...(truthyQuery(editorsPick) ? { editorsPick: true } : {}),
    ...(Object.keys(ratingFilter).length
      ? { averageRating: ratingFilter }
      : {}),
  };

  const orderBy =
    sort === 'top'
      ? { averageRating: 'desc' as const }
      : sort === 'title'
        ? { title: 'asc' as const }
        : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: { _count: { select: { reviews: true, watchlisted: true } } },
    }),
    prisma.media.count({ where: whereClause }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getMediaById = async (id: string, viewerUserId?: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      reviews: {
        where: viewerUserId
          ? {
              OR: [
                { isPublished: true },
                { userId: viewerUserId, isPublished: false },
              ],
            }
          : { isPublished: true },
        include: {
          user: { select: { id: true, name: true, email: true } },
          likes: { select: { userId: true } },
          comments: {
            where: { isPublished: true },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!media) throw new AppError('Media not found', 404);

  let streamUrl = media.streamUrl;
  if (media.pricingType === PricingType.PREMIUM) {
    if (
      !viewerUserId ||
      !(await userHasPremiumStreamAccess(viewerUserId, id))
    ) {
      streamUrl = null;
    }
  }

  return { ...media, streamUrl };
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
    editorsPick = false,
  } = payload;

  if (!title || !synopsis || !releaseYear || !director) {
    throw new AppError(
      'title, synopsis, releaseYear, and director are required',
      422,
    );
  }

  const purchasePrice = parseOptionalFloat(
    payload.purchasePrice,
    'purchasePrice',
  );
  const rentalPrice = parseOptionalFloat(payload.rentalPrice, 'rentalPrice');

  let rentalDurationDays = 7;
  if (
    payload.rentalDurationDays !== undefined &&
    payload.rentalDurationDays !== ''
  ) {
    rentalDurationDays = parseInteger(
      payload.rentalDurationDays,
      'rentalDurationDays',
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
      editorsPick: Boolean(editorsPick),
      purchasePrice: purchasePrice ?? null,
      rentalPrice: rentalPrice ?? null,
      rentalDurationDays,
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
    'editorsPick',
  ] as const) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }

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
  if (payload.purchasePrice !== undefined) {
    data.purchasePrice =
      payload.purchasePrice === null || payload.purchasePrice === ''
        ? null
        : parseOptionalFloat(payload.purchasePrice, 'purchasePrice');
  }
  if (payload.rentalPrice !== undefined) {
    data.rentalPrice =
      payload.rentalPrice === null || payload.rentalPrice === ''
        ? null
        : parseOptionalFloat(payload.rentalPrice, 'rentalPrice');
  }
  if (payload.rentalDurationDays !== undefined)
    data.rentalDurationDays = parseInteger(
      payload.rentalDurationDays,
      'rentalDurationDays',
    );

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
  userHasPremiumStreamAccess,
};
