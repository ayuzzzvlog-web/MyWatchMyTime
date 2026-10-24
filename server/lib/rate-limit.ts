import type { NextFunction, Request, Response } from 'express';

interface Options {
  windowMs: number;
  max: number;
}

const buckets = new Map<string, { count: number; reset: number }>();

/** Small in-memory limiter — enough to stop casual form spam, no external deps. */
export function rateLimit({ windowMs, max }: Options) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.reset < now) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.reset - now) / 1000));
      return res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
    }
    return next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset < now) buckets.delete(key);
}, 120_000).unref();
