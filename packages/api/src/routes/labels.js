import express from 'express';
import { z } from 'zod';
import { labelController } from '../controllers/labelController.js';
import { authenticate, requireBoardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createLabelSchema = z.object({
  body: z.object({
    boardId: z.string(),
    name: z.string().min(1),
    color: z.string(),
  }),
});

const updateLabelSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    color: z.string().optional(),
  }),
});

router.use(authenticate);

router.post('/', validate(createLabelSchema), requireBoardAccess, labelController.create);
router.get('/', labelController.list);
router.put('/:id', requireBoardAccess, validate(updateLabelSchema), labelController.update);
router.delete('/:id', requireBoardAccess, labelController.delete);

export default router;
