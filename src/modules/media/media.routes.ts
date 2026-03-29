import { Router } from 'express';
import { optionalAuth, requireAuth, requireRole } from '../../middleware/auth.js';
import { MediaController } from './media.controller.js';
import { Role } from '../../generated/prisma/index.js';

const router = Router();

router.get('/', MediaController.getAll);
router.get('/:id', optionalAuth, MediaController.getOne);
router.post('/', requireAuth, requireRole(Role.ADMIN), MediaController.create);
router.patch(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  MediaController.update,
);
// router.delete('/:id', MediaController.remove);
router.delete(
  '/:id',
  requireAuth,
  requireRole(Role.ADMIN),
  MediaController.remove,
);

export const MediaRoutes = router;
