import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { MediaController } from './media.controller.js';

const router = Router();

router.get('/', MediaController.getAll);
router.get('/:id', MediaController.getOne);
// router.post('/', requireAuth, requireRole('ADMIN'), MediaController.create);
router.post('/', MediaController.create);
router.patch('/:id', MediaController.update);
// router.patch('/:id', requireAuth, requireRole('ADMIN'), MediaController.update);
router.delete('/:id', MediaController.remove);
// router.delete(
//   '/:id',
//   requireAuth,
//   requireRole('ADMIN'),
//   MediaController.remove,
// );

export const MediaRoutes = router;
