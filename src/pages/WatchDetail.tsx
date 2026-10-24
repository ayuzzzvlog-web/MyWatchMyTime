import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Heart,
  Maximize2,
  Scale,
  Share2,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Watch } from '../lib/types';
import { cx, discountPercent, formatDate, money, specRows, availabilityTone } from '../lib/format';
import { useCompare, useSettings, useShortlist, useToast } from '../lib/store';
import { Badge, Button, Skeleton } from '../components/ui';
import { WatchCard } from '../components/WatchCard';
import { useShell } from '../components/AppShell';

export default function WatchDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { openEnquiry } = useShell();
  const { push } = useToast();
  const shortlist = useShortlist();
  const compare = useCompare();

  const [watch, setWatch] = useState<Watch | null>(null);
  const [related, setRelated] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    window.scrollTo({ top: 0 });
    api
      .watch(slug)
      .then((res) => {
        setWatch(res.watch);
        setRelated(res.related);
        document.title = `${res.watch.brand} ${res.watch.name} — ${settings.brandName}`;
      })
      .catch(() => setWatch(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // SEO: structured data for rich results
  useEffect(() => {
    if (!watch) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${watch.brand} ${watch.name}`,
      sku: watch.reference || watch.id,
      brand: { '@type': 'Brand', name: watch.brand },
      description: watch.shortDescription || watch.description,
      image: watch.images.map((image) => new URL(image, window.location.origin).href),
      offers: {
        '@type': 'Offer',
        price: watch.price,
        priceCurrency: watch.currency,
        availability:
          watch.availability === 'Sold Out'
            ? 'https://schema.org/SoldOut'
            : watch.availability === 'Made to Order'
              ? 'https://schema.org/PreOrder'
              : 'https://schema.org/InStock',
      },
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [watch]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % (watch?.images.length || 1));
      if (e.key === 'ArrowLeft')
        setActiveImage((i) => (i - 1 + (watch?.images.length || 1)) % (watch?.images.length || 1));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, watch]);

  const share = async () => {
    if (!watch) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${watch.brand} ${watch.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        push({ title: 'Link copied', tone: 'success' });
      }
    } catch {
      /* dismissed */
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
        <p className="display text-5xl text-ivory">Reference not found</p>
        <p className="mt-4 text-sm text-ivory/40">
          This piece may have found a home. Browse the current catalogue instead.
        </p>
        <Link to="/collection" className="mt-8">
          <Button variant="outline">Back to the collection</Button>
        </Link>
      </div>
    );
  }

  const discount = discountPercent(watch.price, watch.compareAtPrice);
  const tone = availabilityTone(watch.availability);
  const saved = shortlist.has(watch.id);
  const comparing = compare.has(watch.id);
  const rows = specRows(watch);

  const onMove = (e: React.MouseEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoom({
      active: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="pb-28 lg:pb-0">
      {/* breadcrumb */}
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-5 py-5 text-[10px] tracking-[0.14em] text-ivory/30 uppercase sm:px-8">
        <Link to="/" className="hover:text-ivory/60">
          Home
        </Link>
        <ChevronRight className="size-2.5" />
        <Link to="/collection" className="hover:text-ivory/60">
          Collection
        </Link>
        <ChevronRight className="size-2.5" />
        <Link to={`/collection?category=${encodeURIComponent(watch.category)}`} className="hover:text-ivory/60">
          {watch.category}
        </Link>
        <ChevronRight className="size-2.5" />
        <span className="truncate text-ivory/60">{watch.name}</span>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            ref={stageRef}
            onMouseMove={onMove}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            onClick={() => setLightbox(true)}
            className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-surface-2"
          >
            <motion.img
              key={watch.images[activeImage]}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              src={watch.images[activeImage]}
              alt={`${watch.brand} ${watch.name}`}
              className="size-full object-cover"
              style={
                zoom.active
                  ? {
                      transform: 'scale(1.9)',
                      transformOrigin: `${zoom.x}% ${zoom.y}%`,
                      transition: 'transform 0.2s ease-out',
                    }
                  : { transition: 'transform 0.5s ease' }
              }
            />
            <div className="pointer-events-none absolute inset-0 border border-ivory/8" />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {watch.badge && <Badge tone="solid">{watch.badge}</Badge>}
              {discount && <Badge tone="gold">−{discount}%</Badge>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(true);
              }}
              aria-label="Expand image"
              className="absolute right-4 bottom-4 grid size-9 place-items-center border border-white/25 bg-black/40 text-ivory/80 backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              <Maximize2 className="size-3.5" />
            </button>
            <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 text-[9px] tracking-[0.18em] text-ivory/40 uppercase opacity-0 transition-opacity group-hover:opacity-100">
              <Eye className="size-3" /> Hover to zoom
            </div>
          </div>

          {watch.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {watch.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={cx(
                    'size-20 shrink-0 overflow-hidden border transition-all duration-300',
                    index === activeImage ? 'border-gold opacity-100' : 'border-transparent opacity-45 hover:opacity-80',
                  )}
                >
                  <img src={image} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div className="pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to={`/collection?brand=${encodeURIComponent(watch.brand)}`}
                className="text-[10px] font-medium tracking-[0.28em] text-gold/80 uppercase hover:text-gold"
              >
                {watch.brand}
              </Link>
              <h1 className="display mt-3 text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[0.95] text-ivory">
                {watch.name}
              </h1>
              <p className="mt-3 text-[11px] tracking-[0.16em] text-ivory/35 uppercase">
                {[watch.collection, watch.reference].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => shortlist.toggle(watch.id)}
                aria-label="Save"
                className={cx(
                  'grid size-10 place-items-center border transition-colors',
                  saved ? 'border-gold/60 text-gold' : 'border-ivory/12 text-ivory/50 hover:text-ivory',
                )}
              >
                <Heart className={cx('size-4', saved && 'fill-gold')} />
              </button>
              <button
                onClick={share}
                aria-label="Share"
                className="grid size-10 place-items-center border border-ivory/12 text-ivory/50 transition-colors hover:text-ivory"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={cx('flex items-center gap-2 border px-2.5 py-1', tone.ring)}>
              <span className={cx('size-1.5 rounded-full', tone.dot)} />
              <span className={cx('text-[9px] font-medium tracking-[0.16em] uppercase', tone.text)}>
                {watch.availability}
              </span>
            </span>
            <span className="text-[10px] tracking-[0.14em] text-ivory/30 uppercase">{watch.condition}</span>
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-ivory/25 uppercase">
              <Eye className="size-3" /> {watch.views} views
            </span>
          </div>

          {settings.showPrices && (
            <div className="mt-7 flex flex-wrap items-baseline gap-3 border-y border-ivory/10 py-5">
              <span className="display text-4xl text-ivory">{money(watch.price, watch.currency)}</span>
              {watch.compareAtPrice && watch.compareAtPrice > watch.price && (
                <>
                  <span className="text-sm text-ivory/30 line-through">
                    {money(watch.compareAtPrice, watch.currency)}
                  </span>
                  <span className="border border-gold/40 px-2 py-0.5 text-[9px] tracking-[0.14em] text-gold uppercase">
                    Save {money(watch.compareAtPrice - watch.price, watch.currency)}
                  </span>
                </>
              )}
              <p className="ml-auto text-[9px] tracking-[0.14em] text-ivory/25 uppercase">
                Inclusive of taxes
              </p>
            </div>
          )}

          <p className="mt-6 text-sm leading-[1.9] text-ivory/55">{watch.shortDescription}</p>

          {watch.highlights.length > 0 && (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {watch.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-[12px] text-ivory/60">
                  <Check className="mt-0.5 size-3 shrink-0 text-gold" strokeWidth={2.5} />
                  {highlight}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => openEnquiry(watch, watch.availability === 'In Showroom' ? 'viewing' : 'enquiry')}
            >
              {watch.availability === 'Sold Out' ? 'Join the waitlist' : 'Enquire about this piece'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => compare.toggle(watch.id)}
              icon={<Scale className="size-3.5" />}
            >
              {comparing ? 'Comparing' : 'Compare'}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, title: 'Authenticity', text: 'Verified before dispatch' },
              { icon: Truck, title: 'Delivery', text: 'Insured, pan-India' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5 border border-ivory/8 bg-white/[0.015] p-3">
                <item.icon className="mt-0.5 size-4 shrink-0 text-gold/70" strokeWidth={1.4} />
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-ivory/70 uppercase">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-ivory/35">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* specs */}
          <div className="mt-10">
            <div className="flex items-center justify-between border-b border-ivory/12 pb-3">
              <h2 className="text-[10px] tracking-[0.24em] text-gold/85 uppercase">Specifications</h2>
              <span className="text-[9px] tracking-[0.14em] text-ivory/25 uppercase">
                Added {formatDate(watch.createdAt)}
              </span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2">
              {rows.map((row, index) => (
                <div
                  key={row.label}
                  className={cx(
                    'flex items-baseline justify-between gap-4 border-b border-ivory/6 py-2.5',
                    index % 2 === 0 ? 'sm:pr-6' : 'sm:pl-6',
                  )}
                >
                  <dt className="text-[10px] tracking-[0.14em] text-ivory/30 uppercase">{row.label}</dt>
                  <dd className="text-right text-[12px] text-ivory/80">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* description + story */}
          {watch.description && (
            <div className="mt-10 border-t border-ivory/12 pt-6">
              <h2 className="text-[10px] tracking-[0.24em] text-gold/85 uppercase">The piece</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-[1.95] text-ivory/55">{watch.description}</p>
            </div>
          )}
          {watch.story && (
            <div className="mt-8 border-l border-gold/30 pl-5">
              <h2 className="text-[10px] tracking-[0.24em] text-gold/85 uppercase">Provenance</h2>
              <p className="mt-3 text-sm leading-[1.95] text-ivory/45 italic">{watch.story}</p>
            </div>
          )}

          {watch.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-1.5">
              {watch.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/collection?q=${encodeURIComponent(tag)}`}
                  className="border border-ivory/10 px-2.5 py-1 text-[9px] tracking-[0.14em] text-ivory/35 uppercase transition-colors hover:border-gold/40 hover:text-gold/80"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-ivory/8 bg-[#070709]">
          <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-8 bg-gold/60" />
                  <span className="label text-gold/85">You may also like</span>
                </div>
                <h2 className="display text-3xl text-ivory sm:text-4xl">Nearby in the cabinet</h2>
              </div>
              <Link
                to={`/collection?category=${encodeURIComponent(watch.category)}`}
                className="group hidden items-center gap-2 text-[10px] tracking-[0.2em] text-ivory/40 uppercase hover:text-gold sm:flex"
              >
                More {watch.category} <ArrowRight className="size-3 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((item, index) => (
                <WatchCard key={item.id} watch={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-ivory/10 bg-[#0a0a0d]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          {settings.showPrices && (
            <div>
              <p className="text-[9px] tracking-[0.14em] text-ivory/30 uppercase">Price</p>
              <p className="text-sm text-ivory">{money(watch.price, watch.currency)}</p>
            </div>
          )}
          <Button
            className="ml-auto flex-1"
            onClick={() => openEnquiry(watch, watch.availability === 'In Showroom' ? 'viewing' : 'enquiry')}
          >
            Enquire
          </Button>
          <button
            onClick={() => shortlist.toggle(watch.id)}
            aria-label="Save"
            className={cx(
              'grid size-11 place-items-center border',
              saved ? 'border-gold/60 text-gold' : 'border-ivory/15 text-ivory/50',
            )}
          >
            <Heart className={cx('size-4', saved && 'fill-gold')} />
          </button>
        </div>
      </div>

      {/* lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/96">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[10px] tracking-[0.2em] text-ivory/40 uppercase">
              {watch.brand} {watch.name} · {activeImage + 1}/{watch.images.length}
            </p>
            <button
              onClick={() => setLightbox(false)}
              aria-label="Close"
              className="grid size-9 place-items-center border border-ivory/15 text-ivory/60 hover:text-ivory"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
            {watch.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImage((i) => (i - 1 + watch.images.length) % watch.images.length)
                  }
                  aria-label="Previous"
                  className="absolute left-2 z-10 grid size-10 place-items-center border border-ivory/15 bg-black/50 text-ivory/70 hover:text-gold sm:left-6"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % watch.images.length)}
                  aria-label="Next"
                  className="absolute right-2 z-10 grid size-10 place-items-center border border-ivory/15 bg-black/50 text-ivory/70 hover:text-gold sm:right-6"
                >
                  <ArrowRight className="size-4" />
                </button>
              </>
            )}
            <img
              src={watch.images[activeImage]}
              alt={watch.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mx-auto mt-4 flex items-center gap-2 px-5 pb-6 text-[10px] tracking-[0.18em] text-ivory/30 uppercase hover:text-ivory sm:px-8"
      >
        <ArrowLeft className="size-3" /> Back
      </button>
    </div>
  );
}
