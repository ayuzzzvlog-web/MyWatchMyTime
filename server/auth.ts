import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret, readDb, saveDb } from './db.js';

const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'unique2026';
const TOKEN_TTL = '7d';

export function hashPassword(password: string, salt?: string) {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, useSalt, 64).toString('hex');
  return { passwordHash: hash, salt: useSalt };
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Create the default admin account on first boot so the CMS is never locked out. */
export function ensureAdmin() {
  const db = readDb();
  if (db.admin) return;
  db.admin = { ...hashPassword(DEFAULT_PASSWORD), updatedAt: new Date().toISOString() };
  void saveDb();
  console.log('[auth] created default admin — password: %s', DEFAULT_PASSWORD);
}

export function verifyPassword(password: string) {
  const db = readDb();
  if (!db.admin) ensureAdmin();
  const admin = readDb().admin!;
  const { passwordHash } = hashPassword(password, admin.salt);
  return safeEqual(passwordHash, admin.passwordHash);
}

export function signToken() {
  return jwt.sign({ role: 'admin', sub: 'unique-trendz' }, getJwtSecret(), {
    expiresIn: TOKEN_TTL,
    issuer: 'unique-trendz',
  });
}

export interface AuthedRequest extends Request {
  admin?: boolean;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    jwt.verify(token, getJwtSecret(), { issuer: 'unique-trendz' });
    req.admin = true;
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }
}

export function changePassword(current: string, next: string) {
  if (!verifyPassword(current)) return { ok: false, error: 'Current password is incorrect' };
  if (next.length < 8) return { ok: false, error: 'New password must be at least 8 characters' };
  const db = readDb();
  db.admin = { ...hashPassword(next), updatedAt: new Date().toISOString() };
  void saveDb();
  return { ok: true };
}
