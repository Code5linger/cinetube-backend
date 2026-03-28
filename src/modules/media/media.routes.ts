import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as mediaController from './media.controller.js';

export const mediaRouter = Router();

mediaRouter.get('/', mediaController.getAll);
mediaRouter.get('/:id', mediaController.getOne);
mediaRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  mediaController.create,
);
mediaRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  mediaController.update,
);
mediaRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  mediaController.remove,
);
