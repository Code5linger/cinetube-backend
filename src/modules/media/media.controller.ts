import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import { ICreateMediaPayload, IUpdateMediaPayload } from './media.interface.js';
import { MediaService } from './media.services.js';

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const media = await MediaService.getAllMedia({
    search: req.query.search ? String(req.query.search) : undefined,
    genre: req.query.genre ? String(req.query.genre) : undefined,
    platform: req.query.platform ? String(req.query.platform) : undefined,
    year: req.query.year ? String(req.query.year) : undefined,
    sort: req.query.sort ? String(req.query.sort) : undefined,
  });
  res.json({
    success: true,
    message: 'Media retrieved successfully',
    data: media,
  });
});

const getOne = asyncHandler(async (req: Request, res: Response) => {
  const media = await MediaService.getMediaById(String(req.params.id));
  res.json({
    success: true,
    message: 'Media retrieved successfully',
    data: media,
  });
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const media = await MediaService.createMedia(req.body as ICreateMediaPayload);
  res.status(201).json({
    success: true,
    message: 'Media created successfully',
    data: media,
  });
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const media = await MediaService.updateMedia(
    String(req.params.id),
    req.body as IUpdateMediaPayload,
  );
  res.json({
    success: true,
    message: 'Media updated successfully',
    data: media,
  });
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await MediaService.deleteMedia(String(req.params.id));
  res.json({
    success: true,
    message: 'Media deleted successfully',
    data: null,
  });
});

export const MediaController = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
