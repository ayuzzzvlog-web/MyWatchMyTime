import { Router } from 'express';
import { readDb, saveDb } from '../db.js';
import { requireAuth } from '../auth.js';
import { settingsSchema } from '../validation.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ settings: readDb().settings });
});

router.put('/', requireAuth, async (req, res) => {
  const parsed = settingsSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid settings', issues: parsed.error.flatten() });
  }
  const db = readDb();
  db.settings = { ...db.settings, ...parsed.data };
  await saveDb();
  return res.json({ settings: db.settings });
});

export default router;
