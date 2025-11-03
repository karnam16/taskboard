import express from 'express';
import { z } from 'zod';
import { cardController } from '../controllers/cardController.js';
import { authenticate, requireBoardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createCardSchema = z.object({
  body: z.object({
    boardId: z.string(),
    listId: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
  }),
});

const updateCardSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    assignees: z.array(z.string()).optional(),
    checklist: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          done: z.boolean(),
        })
      )
      .optional(),
  }),
});

const moveCardSchema = z.object({
  body: z.object({
    listId: z.string(),
    order: z.number(),
  }),
});

router.use(authenticate);

router.get('/', cardController.list);
router.post('/', validate(createCardSchema), requireBoardAccess, cardController.create);
router.put('/:id', requireBoardAccess, validate(updateCardSchema), cardController.update);
router.delete('/:id', requireBoardAccess, cardController.delete);
router.post('/:id/move', requireBoardAccess, validate(moveCardSchema), cardController.move);

export default router;
