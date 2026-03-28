import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/http.js';
import {
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from './admin.interface.js';

const recomputeAverageRating = async (mediaId: string) => {
  const agg = await prisma.review.aggregate({
    where: { mediaId, isPublished: true },
    _avg: { rating: true },
  });
  await prisma.media.update({
    where: { id: mediaId },
    data: { averageRating: Number((agg._avg.rating ?? 0).toFixed(2)) },
  });
};

const getDashboard = async () => {
  const [
    totalUsers,
    totalMedia,
    totalReviews,
    publishedReviews,
    pendingReviews,
    totalPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.media.count(),
    prisma.review.count(),
    prisma.review.count({ where: { isPublished: true } }),
    prisma.review.findMany({
      where: { isPublished: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
        media: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.payment.count(),
  ]);

  return {
    stats: {
      totalUsers,
      totalMedia,
      totalReviews,
      publishedReviews,
      pendingReviewsCount: totalReviews - publishedReviews,
      totalPayments,
    },
    pendingReviews,
  };
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const approveReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { isPublished: true },
  });

  await recomputeAverageRating(review.mediaId);
  return updated;
};

const unpublishReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { isPublished: false },
  });

  await recomputeAverageRating(review.mediaId);
  return updated;
};

const deleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError('Review not found', 404);

  await prisma.review.delete({ where: { id: reviewId } });
  await recomputeAverageRating(review.mediaId);
};

const changeUserStatus = async (
  payload: IChangeUserStatusPayload,
  requestingUserId: string,
) => {
  const { userId } = payload;

  if (userId === requestingUserId) {
    throw new AppError('You cannot change your own status', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { role: user.role },
    select: { id: true, name: true, email: true, role: true },
  });
};

const changeUserRole = async (
  payload: IChangeUserRolePayload,
  requestingUserId: string,
) => {
  const { userId, role } = payload;

  if (userId === requestingUserId) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
};

const deleteUser = async (userId: string, requestingUserId: string) => {
  if (userId === requestingUserId) {
    throw new AppError('You cannot delete yourself', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  // cascade: sessions, accounts, reviews, watchlist all have onDelete: Cascade
  await prisma.user.delete({ where: { id: userId } });
};

const getMediaAnalytics = async () => {
  return prisma.media.findMany({
    select: {
      id: true,
      title: true,
      averageRating: true,
      _count: { select: { reviews: true, watchlisted: true } },
    },
    orderBy: { averageRating: 'desc' },
  });
};

export const AdminService = {
  getDashboard,
  getAllUsers,
  approveReview,
  unpublishReview,
  deleteReview,
  changeUserStatus,
  changeUserRole,
  deleteUser,
  getMediaAnalytics,
};
