# Unique Trendz — Curated Timepieces

A full-stack **watch catalogue** (not a checkout-driven shop). Clients browse, search,
compare and shortlist pieces, then enquire or book a private viewing. You manage the
catalogue — images, specifications, pricing, availability and enquiries — from a private
curator dashboard.

Built to feel like a printed watch magazine: warm ivory type, gold hairlines, editorial
photography, subtle motion. Everything is real — no Lorem Ipsum, no placeholder products.

```
Frontend   React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion
Backend    Node + Express 5 + Zod + JWT + Sharp (image processing)
Storage    JSON document store + local / disk image uploads (zero database setup)
```

---

## Feature tour

### For clients

| | |
|---|---|
| **Editorial homepage** | Parallax hero, live ticking dial (real local time), animated headline reveal, curated "Edit" grid with category tabs, brand marquee, founding story with counters, category cards, process, rotating testimonials, appointment CTA. |
| **Collection page** | Instant search, faceted filters (brand, category, movement, worn by, availability), budget slider, six sort modes, grid/list toggle — every filter is reflected in the URL so any view is shareable. Sticky toolbar, mobile filter drawer, loading skeletons and a graceful empty state. |
| **Watch detail** | Multi-image gallery with hover zoom and full-screen lightbox (arrow keys), live availability badge, discount math, highlights, full specification table, description, provenance note, related pieces, and a sticky mobile enquiry bar. |
| **Shortlist** | Heart any piece — saved to your device (localStorage) and gathered in a slide-over drawer. |
| **Compare** | Add up to three watches and compare them field by field; differences are highlighted. |
| **Command palette** | `⌘K` / `Ctrl+K` from anywhere: live catalogue search and quick navigation, keyboard-driven. |
| **Enquiry flows** | Quick enquiry dialog (with the piece attached), viewing requests, WhatsApp deep links, contact page form. All land in the curator inbox. |
| **Details that matter** | Scroll progress bar, toast notifications, film grain, page transitions, reduced-motion support, SEO/OG tags, custom 404. |

### For you (curator dashboard at `/admin`)

- Password login (JWT, 7-day sessions)
- **Overview** — catalogue counts, views, new enquiries, category/brand breakdown, most-viewed and recently added pieces
- **Watches** — searchable table, publish/unpublish and feature toggles inline, duplicate, delete with confirmation, draft state
- **Editor** — every detail (identity, specifications, price + compare-at, availability, condition, highlights, tags, badge, description, provenance, curated position) with a **live card preview** and a completeness checklist
- **Photographs** — drag & drop up to 8 images at a time; they are auto-rotated, resized and converted to WebP by Sharp; reorder, set the cover, or add by URL
- **Enquiries** — inbox with statuses (new / contacted / closed), internal notes, call & WhatsApp shortcuts, one-click CSV export
- **Settings** — brand identity, homepage hero copy and image, about text, contact details, socials, currency, public price visibility, password change

---

## Quick start

```bash
npm install
npm run dev          # web on :5173, API on :4000 (proxied)
```

Open <http://localhost:5173>. The curator dashboard lives at
<http://localhost:5173/admin> — the default password is **`unique2026`**
(change it in *Settings → Security* immediately).

The catalogue seeds itself with nine demo pieces and their photography on first boot.

### Production build

```bash
npm run build        # builds the SPA into dist/ and the server into dist-server/
npm start            # one process serves the API *and* the built site on :4000
```

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite + API with hot reload |
| `npm run build` | Production build (web + server) |
| `npm start` | Serve the built app and API |
| `npm run typecheck` | TypeScript across app and server |
| `npm run seed` | Print seed helpers (the DB self-seeds on first boot) |

---

## Deploying

The app is a single Node service, so any Node host works. Catalogue data and uploads live
in `DATA_DIR` — **mount a persistent disk** or your edits disappear on redeploy.

### Render (easiest)

1. Push this repository to GitHub.
2. On [Render](https://render.com): **New → Blueprint**, select the repo. `render.yaml`
   provisions the service, a 1 GB disk at `/var/data`, and generates `ADMIN_PASSWORD` and
   `JWT_SECRET`.
3. Read the generated password from the service's environment tab, then sign in at
   `https://<your-app>.onrender.com/admin`.

### Docker / VPS

```bash
docker build -t unique-trendz .
docker run -d -p 4000:4000 -v unique-trendz-data:/data \
  -e ADMIN_PASSWORD='choose-a-strong-one' unique-trendz
```

Put Nginx or Caddy in front for TLS. The container serves the site and the API on one port.

### GitHub Actions

`.github/workflows/ci.yml` typechecks both projects, builds them, smoke-tests the API,
and verifies the Docker image on every push and PR to `main`.

> **GitHub Pages note:** Pages only serves static files, so it cannot run the API or the
> curator dashboard. Use Render/Railway/Fly/VPS (or the Docker image) for the live site.
> GitHub remains the home of the code and CI.

### Environment variables

All optional — see `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Port for API + static site |
| `ADMIN_PASSWORD` | `unique2026` | Password used when the admin account is first created |
| `JWT_SECRET` | generated → `data/.jwt-secret` | Signs admin sessions |
| `DATA_DIR` | `./data` | Where `db.json` and uploads live |
| `UPLOAD_DIR` | `$DATA_DIR/uploads` | Where processed images are stored |

---

## API reference

All routes are prefixed with `/api`. Admin routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | – | Liveness + counts |
| `GET` | `/watches` | – | Filter, search, sort, paginate (`q, brand, category, gender, movement, availability, minPrice, maxPrice, featured, sort, page, limit`) |
| `GET` | `/watches/facets` | – | Filter options with counts and price range |
| `GET` | `/watches/:idOrSlug` | – | Single watch + related; increments views |
| `POST` | `/watches` | ✓ | Create |
| `PUT` | `/watches/:id` | ✓ | Update |
| `PATCH` | `/watches/:id` | ✓ | Quick toggles (`published`, `featured`, `availability`, `sortOrder`) |
| `POST` | `/watches/:id/duplicate` | ✓ | Duplicate as a draft |
| `POST` | `/watches/reorder` | ✓ | Reorder curated positions |
| `DELETE` | `/watches/:id` | ✓ | Delete |
| `POST` | `/uploads` | ✓ | Multipart image upload (`images`, max 8 × 15 MB) → WebP |
| `DELETE` | `/uploads/:filename` | ✓ | Remove an uploaded image |
| `POST` | `/inquiries` | – | Public enquiry (rate limited, validated) |
| `GET` | `/inquiries` | ✓ | Inbox |
| `PATCH` | `/inquiries/:id` | ✓ | Status / internal note |
| `DELETE` | `/inquiries/:id` | ✓ | Delete |
| `GET` | `/inquiries/export.csv` | ✓ | CSV export |
| `GET` | `/settings` | – | Public site settings |
| `PUT` | `/settings` | ✓ | Update settings |
| `GET` | `/stats` | ✓ | Dashboard metrics |
| `POST` | `/auth/login` | – | Password → JWT (rate limited) |
| `GET` | `/auth/session` | ✓ | Validate token |
| `POST` | `/auth/password` | ✓ | Change password |

---

## Project structure

```
server/
  index.ts              Express app: security, static uploads, SPA fallback
  db.ts                 JSON document store, atomic writes, slug helpers
  seed.ts               Demo catalogue + default site settings
  auth.ts               scrypt password hashing, JWT sessions
  validation.ts         Zod schemas for every write
  routes/               watches · uploads · inquiries · settings · auth · stats
  lib/rate-limit.ts     In-memory limiter for public endpoints

src/
  pages/                Home · Collection · WatchDetail · About · Contact · NotFound
  pages/admin/          Login · Layout · Dashboard · Watches · Editor · Inquiries · Settings
  components/           AppShell (nav/footer/palette) · WatchCard · QuickView · Compare/Shortlist
                        drawers · EnquiryDialog · LiveDial · Toasts · ui kit
  lib/                  api client · typed models · formatting · settings/toast/store contexts

public/images/          Seeded catalogue photography
data/                   Runtime: db.json + uploads (git-ignored)
```

## Design system

| Token | Value | Use |
|---|---|---|
| Ink | `#08080a` | Page background |
| Ivory | `#f4efe6` | Primary text |
| Gold | `#c9a46a` | Accents, hairlines, CTAs |
| Cormorant Garamond | display | Headlines, prices, numerals |
| Jost | sans | Labels, UI, body |

Tokens live in `src/index.css` under `@theme` — change the palette there and the whole
site follows.

## Notes on content

Brand names in the seeded demo catalogue are fictional. Replace them with your own stock
from the dashboard — the seed only runs when `data/db.json` does not exist yet.

---

© Unique Trendz. Built to be handed to a real business: clone it, point it at a disk, and
start uploading photographs.
