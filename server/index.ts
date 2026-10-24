import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR, UPLOAD_DIR, readDb } from './db.js';
import { ensureAdmin } from './auth.js';
import watchesRouter from './routes/watches.js';
import uploadsRouter from './routes/uploads.js';
import inquiriesRouter from './routes/inquiries.js';
import settingsRouter from './routes/settings.js';
import authRouter from './routes/auth.js';
import statsRouter from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    immutable: true,
    fallthrough: true,
  }),
);
app.use('/api/uploads', uploadsRouter);
app.use('/api/watches', watchesRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => {
  const db = readDb();
  res.json({
    ok: true,
    watches: db.watches.length,
    adminConfigured: Boolean(db.admin),
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API route' });
});

// In production the API also serves the built SPA.
const distDir = path.resolve(__dirname, '..', 'dist');
const fallbackDist = path.resolve('dist');
const staticDir = fs.existsSync(distDir) ? distDir : fs.existsSync(fallbackDist) ? fallbackDist : null;

if (staticDir) {
  app.use(express.static(staticDir, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  console.log(`[server] serving web build from ${staticDir}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] error', err);
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({ error: err.message || 'Something went wrong' });
});

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });
readDb();
ensureAdmin();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Unique Trendz API listening on http://0.0.0.0:${PORT}`);
});
