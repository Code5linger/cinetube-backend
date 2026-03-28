import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/http.js';
import * as mediaService from './media.service.js';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { search, genre, platform, year, sort } = req.query as Record<
    string,
    string
  >;
  const media = await mediaService.getAllMedia({
    search,
    genre,
    platform,
    year,
    sort,
  });
  res.json(media);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.getMediaById(req.params.id);
  res.json(media);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.createMedia(req.body);
  res.status(201).json(media);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.updateMedia(req.params.id, req.body);
  res.json(media);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMedia(req.params.id);
  res.json({ message: 'Deleted' });
});
