import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import { ReviewService } from './review.service.js';
import {
  ICreateCommentPayload,
  ICreateReviewPayload,
  IUpdateReviewPayload,
} from './review.interface.js';
import { Role } from '../../generated/prisma/index.js';

const getAllReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await ReviewService.getAllReviews();
  res.json({
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews,
  });
});

const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await ReviewService.createReview(
    req.body as ICreateReviewPayload,
    req.user!.id,
  );
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully. Pending approval.',
    data: review,
  });
});

const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await ReviewService.updateReview(
    String(req.params.id),
    req.body as IUpdateReviewPayload,
    req.user!.id,
    req.user!.role as Role,
  );
  res.json({
    success: true,
    message: 'Review updated successfully',
    data: review,
  });
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(
    String(req.params.id),
    req.user!.id,
    req.user!.role as Role,
  );
  res.json({
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const result = await ReviewService.toggleLike(
    String(req.params.id),
    req.user!.id,
  );
  res.json({
    success: true,
    message: result.liked ? 'Review liked' : 'Review unliked',
    data: result,
  });
});

const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await ReviewService.createComment(
    String(req.params.id),
    req.body as ICreateCommentPayload,
    req.user!.id,
  );
  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment,
  });
});

const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await ReviewService.approveReview(String(req.params.id));
  res.json({
    success: true,
    message: 'Review approved successfully',
    data: review,
  });
});

const unpublishReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await ReviewService.unpublishReview(String(req.params.id));
  res.json({
    success: true,
    message: 'Review unpublished successfully',
    data: review,
  });
});

const getPendingReviews = asyncHandler(async (_req: Request, res: Response) => {
  const reviews = await ReviewService.getPendingReviews();
  res.json({
    success: true,
    message: 'Pending reviews retrieved successfully',
    data: reviews,
  });
});

export const ReviewController = {
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
