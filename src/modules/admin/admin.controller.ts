import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import { AdminService } from './admin.service.js';
import {
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from './admin.interface.js';

const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboard();
  res.json({
    success: true,
    message: 'Dashboard data fetched successfully',
    data: result,
  });
});

const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  res.json({
    success: true,
    message: 'Users fetched successfully',
    data: result,
  });
});

const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.approveReview(String(req.params.id));
  res.json({
    success: true,
    message: 'Review approved successfully',
    data: result,
  });
});

const unpublishReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.unpublishReview(String(req.params.id));
  res.json({
    success: true,
    message: 'Review unpublished successfully',
    data: result,
  });
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deleteReview(String(req.params.id));
  res.json({
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.changeUserStatus(
    req.body as IChangeUserStatusPayload,
    req.user!.id,
  );
  res.json({
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.changeUserRole(
    req.body as IChangeUserRolePayload,
    req.user!.id,
  );
  res.json({
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await AdminService.deleteUser(String(req.params.userId), req.user!.id);
  res.json({ success: true, message: 'User deleted successfully', data: null });
});

const getMediaAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AdminService.getMediaAnalytics();
  res.json({
    success: true,
    message: 'Media analytics fetched successfully',
    data: result,
  });
});

export const AdminController = {
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
