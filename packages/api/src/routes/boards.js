import express from 'express';
import { z } from 'zod';
import { boardController } from '../controllers/boardController.js';
import { authenticate, requireOrgMembership, requireBoardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createBoardSchema = z.object({
  body: z.object({
    orgId: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
  }),
});

const updateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  }),
});

router.use(authenticate);

router.post(
  '/',
  validate(createBoardSchema),
  requireOrgMembership('member'),
  boardController.create
);
router.get('/', boardController.list);
router.get('/:id', requireBoardAccess, boardController.getById);
router.put('/:id', requireBoardAccess, validate(updateBoardSchema), boardController.update);
router.delete('/:id', requireBoardAccess, boardController.delete);
router.get('/:id/activity', requireBoardAccess, boardController.getActivity);

export default router;
