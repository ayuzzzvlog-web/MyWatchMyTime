import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { getJwtSecret, readDb, saveDb, uniqueSlug } from '../db.js';
import { requireAuth } from '../auth.js';
import { watchInputSchema } from '../validation.js';
import type { Watch } from '../types.js';

const router = Router();

function isAdmin(req: { headers: { authorization?: string } }) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.slice(7), getJwtSecret(), { issuer: 'unique-trendz' });
    return true;
  } catch {
    return false;
  }
}

function publicShape(w: Watch, admin: boolean) {
  if (admin) return w;
  const { ...rest } = w;
  return rest;
}

/** GET /api/watches — filterable public catalogue */
router.get('/', (req, res) => {
  const db = readDb();
  const admin = isAdmin(req);
  const {
    q = '',
    brand = '',
    category = '',
    gender = '',
    movement = '',
    availability = '',
    condition = '',
    minPrice = '',
    maxPrice = '',
    featured = '',
    sort = 'curated',
    page = '1',
    limit = '60',
    includeUnpublished = '',
  } = req.query as Record<string, string>;

  const withDrafts = admin && includeUnpublished === '1';
  let items = db.watches.filter((w) => withDrafts || w.published);

  const term = q.trim().toLowerCase();
  if (term) {
    items = items.filter((w) =>
      [w.name, w.brand, w.reference, w.collection, w.category, w.tags.join(' '), w.shortDescription]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }
  const multi = (value: string, field: keyof Watch) =>
    value ? items.filter((w) => value.split(',').includes(String(w[field]))) : items;

  items = multi(brand, 'brand');
  items = multi(category, 'category');
  items = multi(gender, 'gender');
  items = multi(movement, 'movement');
  items = multi(availability, 'availability');
  items = multi(condition, 'condition');
  if (featured === '1') items = items.filter((w) => w.featured);

  const min = Number(minPrice);
  const max = Number(maxPrice);
  if (Number.isFinite(min) && minPrice !== '') items = items.filter((w) => w.price >= min);
  if (Number.isFinite(max) && maxPrice !== '') items = items.filter((w) => w.price <= max);

  const sorters: Record<string, (a: Watch, b: Watch) => number> = {
    curated: (a, b) => a.sortOrder - b.sortOrder,
    newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    popular: (a, b) => b.views - a.views,
  };
  items = [...items].sort(sorters[sort] || sorters.curated);

  const total = items.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(120, Math.max(1, Number(limit) || 60));
  const paged = items.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    items: paged.map((w) => publicShape(w, admin)),
    total,
    page: pageNum,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

/** GET /api/watches/facets — filter options derived from live data */
router.get('/facets', (req, res) => {
  const db = readDb();
  const admin = isAdmin(req);
  const items = db.watches.filter((w) => w.published || admin);
  const count = (field: keyof Watch) => {
    const map = new Map<string, number>();
    for (const w of items) {
      const key = String(w[field] || '').trim();
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].map(([name, n]) => ({ name, count: n })).sort((a, b) => b.count - a.count);
  };
  const prices = items.map((w) => w.price);
  res.json({
    brands: count('brand'),
    categories: count('category'),
    genders: count('gender'),
    movements: count('movement'),
    conditions: count('condition'),
    availabilities: count('availability'),
    price: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 100000,
    },
    total: items.length,
  });
});

/** GET /api/watches/:idOrSlug */
router.get('/:idOrSlug', (req, res) => {
  const db = readDb();
  const admin = isAdmin(req);
  const key = req.params.idOrSlug;
  const watch = db.watches.find((w) => w.id === key || w.slug === key);
  if (!watch) return res.status(404).json({ error: 'Watch not found' });
  if (!watch.published && !admin) return res.status(404).json({ error: 'Watch not found' });

  if (!admin) {
    watch.views += 1;
    void saveDb();
  }

  const related = db.watches
    .filter((w) => w.published && w.id !== watch.id && (w.category === watch.category || w.brand === watch.brand))
    .slice(0, 4);

  return res.json({ watch, related });
});

/** POST /api/watches */
router.post('/', requireAuth, async (req, res) => {
  const parsed = watchInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Please check the highlighted fields', issues: parsed.error.flatten() });
  }
  const db = readDb();
  const input = parsed.data;
  const id = `w_${randomUUID().slice(0, 8)}`;
  const watch: Watch = {
    ...input,
    caseSize: input.caseSize ?? null,
    caseThickness: input.caseThickness ?? null,
    compareAtPrice: input.compareAtPrice ?? null,
    id,
    slug: uniqueSlug(`${input.brand}-${input.name}`, db.watches.map((w) => w.slug)),
    sortOrder: input.sortOrder ?? (db.watches.length ? Math.max(...db.watches.map((w) => w.sortOrder)) + 1 : 0),
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.watches.unshift(watch);
  await saveDb();
  return res.status(201).json({ watch });
});

/** PUT /api/watches/:id */
router.put('/:id', requireAuth, async (req, res) => {
  const parsed = watchInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'Please check the highlighted fields', issues: parsed.error.flatten() });
  }
  const db = readDb();
  const existing = db.watches.find((w) => w.id === req.params.id);
  if (!existing) return res.status(404).json({ error: 'Watch not found' });

  const input = parsed.data;
  Object.assign(existing, input, {
    caseSize: input.caseSize ?? null,
    caseThickness: input.caseThickness ?? null,
    compareAtPrice: input.compareAtPrice ?? null,
    slug: uniqueSlug(`${input.brand}-${input.name}`, db.watches.map((w) => w.slug), existing.slug),
    updatedAt: new Date().toISOString(),
  });
  await saveDb();
  return res.json({ watch: existing });
});

/** PATCH /api/watches/:id — quick toggles (publish / feature / availability) */
router.patch('/:id', requireAuth, async (req, res) => {
  const db = readDb();
  const watch = db.watches.find((w) => w.id === req.params.id);
  if (!watch) return res.status(404).json({ error: 'Watch not found' });
  const allowed = ['published', 'featured', 'availability', 'sortOrder'] as const;
  for (const key of allowed) {
    if (key in req.body) {
      // @ts-expect-error narrow assignment
      watch[key] = req.body[key];
    }
  }
  watch.updatedAt = new Date().toISOString();
  await saveDb();
  return res.json({ watch });
});

/** POST /api/watches/reorder */
router.post('/reorder', requireAuth, async (req, res) => {
  const ids: unknown = req.body?.ids;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
  const db = readDb();
  ids.forEach((id, index) => {
    const watch = db.watches.find((w) => w.id === id);
    if (watch) watch.sortOrder = index;
  });
  await saveDb();
  return res.json({ ok: true });
});

/** POST /api/watches/:id/duplicate */
router.post('/:id/duplicate', requireAuth, async (req, res) => {
  const db = readDb();
  const source = db.watches.find((w) => w.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Watch not found' });
  const copy: Watch = {
    ...source,
    id: `w_${randomUUID().slice(0, 8)}`,
    name: `${source.name} (copy)`,
    slug: uniqueSlug(`${source.brand}-${source.name}-copy`, db.watches.map((w) => w.slug)),
    published: false,
    featured: false,
    views: 0,
    sortOrder: source.sortOrder + 0.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.watches.unshift(copy);
  await saveDb();
  return res.status(201).json({ watch: copy });
});

/** DELETE /api/watches/:id */
router.delete('/:id', requireAuth, async (req, res) => {
  const db = readDb();
  const index = db.watches.findIndex((w) => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Watch not found' });
  db.watches.splice(index, 1);
  await saveDb();
  return res.json({ ok: true });
});

export default router;
