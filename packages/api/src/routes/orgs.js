import express from 'express';
import { z } from 'zod';
import { orgController } from '../controllers/orgController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const createOrgSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

router.use(authenticate);

router.post('/', validate(createOrgSchema), orgController.create);
router.get('/', orgController.list);
router.get('/:id', orgController.getById);

export default router;
