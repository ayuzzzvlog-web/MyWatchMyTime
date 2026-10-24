import { Router } from 'express';
import { changePassword, ensureAdmin, requireAuth, signToken, verifyPassword } from '../auth.js';
import { rateLimit } from '../lib/rate-limit.js';

const router = Router();

router.post('/login', rateLimit({ windowMs: 10 * 60_000, max: 10 }), (req, res) => {
  ensureAdmin();
  const password = String(req.body?.password || '');
  if (!password || !verifyPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  return res.json({ token: signToken(), role: 'admin' });
});

router.get('/session', requireAuth, (_req, res) => {
  res.json({ ok: true, role: 'admin' });
});

router.post('/password', requireAuth, (req, res) => {
  const current = String(req.body?.current || '');
  const next = String(req.body?.next || '');
  const result = changePassword(current, next);
  if (!result.ok) return res.status(422).json({ error: result.error });
  return res.json({ ok: true, token: signToken() });
});

export default router;
