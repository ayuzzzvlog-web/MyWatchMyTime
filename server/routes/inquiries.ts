import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { readDb, saveDb } from '../db.js';
import { requireAuth } from '../auth.js';
import { inquirySchema } from '../validation.js';
import { rateLimit } from '../lib/rate-limit.js';

const router = Router();

/** POST /api/inquiries — public contact / viewing request */
router.post('/', rateLimit({ windowMs: 60_000, max: 6 }), async (req, res) => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Please check your details', issues: parsed.error.flatten() });
  }
  const db = readDb();
  const data = parsed.data;
  const watch = data.watchId ? db.watches.find((w) => w.id === data.watchId) : undefined;

  db.inquiries.unshift({
    id: `i_${randomUUID().slice(0, 8)}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    type: data.type,
    watchId: watch?.id ?? null,
    watchName: watch ? `${watch.brand} ${watch.name}` : null,
    status: 'new',
    note: '',
    createdAt: new Date().toISOString(),
  });
  await saveDb();
  return res.status(201).json({
    ok: true,
    message: 'Thank you — we will be in touch within one working day.',
  });
});

router.get('/', requireAuth, (req, res) => {
  const db = readDb();
  const status = String(req.query.status || '');
  const items = status ? db.inquiries.filter((i) => i.status === status) : db.inquiries;
  res.json({ items });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const db = readDb();
  const inquiry = db.inquiries.find((i) => i.id === req.params.id);
  if (!inquiry) return res.status(404).json({ error: 'Enquiry not found' });
  if (['new', 'contacted', 'closed'].includes(req.body.status)) inquiry.status = req.body.status;
  if (typeof req.body.note === 'string') inquiry.note = req.body.note.slice(0, 2000);
  await saveDb();
  return res.json({ inquiry });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const db = readDb();
  const index = db.inquiries.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Enquiry not found' });
  db.inquiries.splice(index, 1);
  await saveDb();
  return res.json({ ok: true });
});

/** GET /api/inquiries/export.csv */
router.get('/export.csv', requireAuth, (req, res) => {
  const db = readDb();
  const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Name', 'Phone', 'Email', 'Type', 'Watch', 'Status', 'Message', 'Note'],
    ...db.inquiries.map((i) => [
      new Date(i.createdAt).toISOString(),
      i.name,
      i.phone,
      i.email,
      i.type,
      i.watchName || '',
      i.status,
      i.message,
      i.note,
    ]),
  ];
  const csv = rows.map((r) => r.map(escape).join(',')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="unique-trendz-enquiries.csv"');
  res.send(`\uFEFF${csv}`);
});

export default router;
