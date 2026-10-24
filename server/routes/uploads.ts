import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { UPLOAD_DIR } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|avif|gif|heic|heif)$/.test(file.mimetype)) {
      cb(new Error('Only image files are allowed (JPG, PNG, WEBP, AVIF, GIF, HEIC)'));
      return;
    }
    cb(null, true);
  },
});

async function processImage(buffer: Buffer, originalName: string) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'watch';
  const filename = `${base}-${stamp}${rand}.webp`;

  await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toFile(path.join(UPLOAD_DIR, filename));

  // A smaller variant is generated on the fly by the client; keep only the master.
  return {
    url: `/uploads/${filename}`,
    name: originalName,
    size: buffer.length,
  };
}

/** POST /api/uploads — multipart, accepts up to 8 images per request */
router.post('/', requireAuth, (req, res) => {
  upload.array('images', 8)(req, res, async (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      return res.status(400).json({ error: message });
    }
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    if (!files.length) return res.status(400).json({ error: 'No images received' });
    try {
      const results = await Promise.all(files.map((f) => processImage(f.buffer, f.originalname)));
      return res.status(201).json({ files: results });
    } catch (error) {
      console.error('[uploads] processing failed', error);
      return res.status(500).json({ error: 'Could not process that image. Try a different file.' });
    }
  });
});

/** DELETE /api/uploads/:filename */
router.delete('/:filename', requireAuth, async (req, res) => {
  const filename = path.basename(String(req.params.filename));
  if (!/^[a-z0-9-]+\.(webp|jpg|jpeg|png|avif)$/i.test(filename)) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
    return res.json({ ok: true });
  } catch {
    return res.status(404).json({ error: 'File not found' });
  }
});

export default router;
