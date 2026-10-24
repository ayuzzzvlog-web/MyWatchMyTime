import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Database } from './types.js';
import { buildSeedWatches, defaultSettings } from './seed.js';

export const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads'));
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SECRET_FILE = path.join(DATA_DIR, '.jwt-secret');

let cache: Database | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function freshDatabase(): Database {
  return {
    version: 1,
    watches: buildSeedWatches(),
    inquiries: [],
    settings: defaultSettings,
    admin: null,
  };
}

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function readDb(): Database {
  if (cache) return cache;
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    cache = freshDatabase();
    persist(cache);
    return cache;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
    cache = {
      ...freshDatabase(),
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
    if (!Array.isArray(cache.watches)) cache.watches = [];
    if (!Array.isArray(cache.inquiries)) cache.inquiries = [];
    return cache;
  } catch (err) {
    console.error('[db] failed to parse db.json — starting from seed', err);
    cache = freshDatabase();
    return cache;
  }
}

function persist(db: Database) {
  ensureDirs();
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

/** Persist the database in the background, serialising writes so they never interleave. */
export function saveDb(mutator?: (db: Database) => void): Promise<void> {
  const db = readDb();
  if (mutator) mutator(db);
  const snapshot = JSON.parse(JSON.stringify(db)) as Database;
  writeQueue = writeQueue
    .then(() => persist(snapshot))
    .catch((err) => console.error('[db] write failed', err));
  return writeQueue;
}

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  ensureDirs();
  try {
    if (fs.existsSync(SECRET_FILE)) return fs.readFileSync(SECRET_FILE, 'utf8').trim();
    const secret = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
    return secret;
  } catch {
    return 'unique-trendz-dev-secret-change-me';
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 70);
}

export function uniqueSlug(base: string, existing: string[], ignore?: string): string {
  const taken = new Set(existing.filter((s) => s !== ignore));
  const root = slugify(base) || 'watch';
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
