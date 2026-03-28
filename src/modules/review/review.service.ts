import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
import { parseInteger, parseStringArray } from '../../utils/parse.js';
import {
  ICreateCommentPayload,
  ICreateReviewPayload,
  IUpdateReviewPayload,
} from './review.interface.js';
import { Role } from '../../generated/prisma/index.js';

const getAllReviews = async () => {
  return prisma.review.findMany({
    where: { isPublished: true },
    include: {
      user: { select: { id: true, name: true } },
      media: { select: { id: true, title: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createReview = async (payload: ICreateReviewPayload, userId: string) => {
  const { mediaId, content, spoiler = false } = payload;

  if (!mediaId || !payload.rating || !content) {
    throw new AppError('mediaId, rating and content are required', 422);
  }

  const parsedRating = parseInteger(payload.rating, 'rating');
  if (parsedRating < 1 || parsedRating > 10) {
    throw new AppError('rating must be between 1 and 10', 422);
  }

  return prisma.review.create({
    data: {
      mediaId,
      userId,
      rating: parsedRating,
      content,
      spoiler: Boolean(spoiler),
      tags: parseStringArray(payload.tags),
    },
  });
};

const updateReview = async (
  reviewId: string,
  payload: IUpdateReviewPayload,
  userId: string,
  userRole: Role,
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  if (review.userId !== userId && userRole !== Role.ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  if (review.isPublished && userRole !== Role.ADMIN) {
    throw new AppError('Published review cannot be edited', 403);
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(payload.rating !== undefined
        ? { rating: parseInteger(payload.rating, 'rating') }
        : {}),
      ...(payload.content !== undefined ? { content: payload.content } : {}),
      ...(payload.spoiler !== undefined
        ? { spoiler: Boolean(payload.spoiler) }
        : {}),
      ...(payload.tags !== undefined
        ? { tags: parseStringArray(payload.tags) }
        : {}),
    },
  });
};

const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: Role,
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  if (review.userId !== userId && userRole !== Role.ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  await prisma.review.delete({ where: { id: reviewId } });
};

const toggleLike = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  const existing = await prisma.reviewLike.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });

  if (existing) {
    await prisma.reviewLike.delete({
      where: { reviewId_userId: { reviewId, userId } },
    });
    return { liked: false };
  }

  await prisma.reviewLike.create({
    data: { reviewId, userId },
  });

  return { liked: true };
};

const createComment = async (
  reviewId: string,
  payload: ICreateCommentPayload,
  userId: string,
) => {
  const { content, parentId } = payload;

  if (!content) throw new AppError('content is required', 422);

  return prisma.comment.create({
    data: {
      reviewId,
      userId,
      content,
      parentId: parentId ?? null,
    },
    include: { user: { select: { id: true, name: true } } },
  });
};

// Admin only
const approveReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  return prisma.review.update({
    where: { id: reviewId },
    data: { isPublished: true },
  });
};

const unpublishReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  return prisma.review.update({
    where: { id: reviewId },
    data: { isPublished: false },
  });
};

const getPendingReviews = async () => {
  return prisma.review.findMany({
    where: { isPublished: false },
    include: {
      user: { select: { id: true, name: true, email: true } },
      media: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const ReviewService = {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  createComment,
  approveReview,
  unpublishReview,
  getPendingReviews,
};
