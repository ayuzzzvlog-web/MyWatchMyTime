import { Router } from 'express';
import { readDb } from '../db.js';
import { requireAuth } from '../auth.js';
import type { WatchStats } from '../types.js';

const router = Router();

const tally = (values: string[]) => {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) || 0) + 1);
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

router.get('/', requireAuth, (_req, res) => {
  const db = readDb();
  const stats: WatchStats = {
    total: db.watches.length,
    published: db.watches.filter((w) => w.published).length,
    featured: db.watches.filter((w) => w.featured).length,
    brands: new Set(db.watches.map((w) => w.brand)).size,
    inShowroom: db.watches.filter((w) => w.availability === 'In Showroom').length,
    totalViews: db.watches.reduce((sum, w) => sum + w.views, 0),
    inquiries: {
      new: db.inquiries.filter((i) => i.status === 'new').length,
      total: db.inquiries.length,
    },
    byCategory: tally(db.watches.map((w) => w.category)),
    byBrand: tally(db.watches.map((w) => w.brand)),
    recentlyAdded: [...db.watches]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5)
      .map((w) => ({ id: w.id, name: `${w.brand} ${w.name}`, createdAt: w.createdAt })),
  };
  res.json({ stats });
});

export default router;
