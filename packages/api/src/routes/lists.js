import express from 'express';
import { z } from 'zod';
import { listController } from '../controllers/listController.js';
import { authenticate, requireBoardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createListSchema = z.object({
  body: z.object({
    boardId: z.string(),
    name: z.string().min(1),
  }),
});

const updateListSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

const reorderListSchema = z.object({
  body: z.object({
    order: z.number(),
  }),
});

router.use(authenticate);

router.get('/', listController.list);
router.post('/', validate(createListSchema), requireBoardAccess, listController.create);
router.put('/:id', requireBoardAccess, validate(updateListSchema), listController.update);
router.delete('/:id', requireBoardAccess, listController.delete);
router.post('/:id/reorder', requireBoardAccess, validate(reorderListSchema), listController.reorder);

export default router;
