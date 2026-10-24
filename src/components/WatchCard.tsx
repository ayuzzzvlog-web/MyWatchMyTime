import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, Heart, Scale } from 'lucide-react';
import type { Watch } from '../lib/types';
import { cx, discountPercent, money } from '../lib/format';
import { useCompare, useSettings, useShortlist } from '../lib/store';

interface Props {
  watch: Watch;
  index?: number;
  layout?: 'grid' | 'list';
  onQuickView?: (watch: Watch) => void;
}

export const WatchCard = memo(function WatchCard({ watch, index = 0, layout = 'grid', onQuickView }: Props) {
  const { settings } = useSettings();
  const shortlist = useShortlist();
  const compare = useCompare();
  const [loaded, setLoaded] = useState(false);
  const discount = discountPercent(watch.price, watch.compareAtPrice);
  const saved = shortlist.has(watch.id);
  const comparing = compare.has(watch.id);

  if (layout === 'list') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
        className="group grid grid-cols-[110px_1fr] gap-4 border-b border-ivory/8 py-5 sm:grid-cols-[180px_1fr] sm:gap-6"
      >
        <Link to={`/watch/${watch.slug}`} className="relative block aspect-square overflow-hidden bg-surface">
          <img
            src={watch.images[0]}
            alt={`${watch.brand} ${watch.name}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label text-[9px] text-gold/70">{watch.brand}</p>
              <Link to={`/watch/${watch.slug}`} className="mt-1 block">
                <h3 className="display truncate text-2xl text-ivory transition-colors group-hover:text-gold-soft sm:text-3xl">
                  {watch.name}
                </h3>
              </Link>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => shortlist.toggle(watch.id)}
                aria-label="Save to shortlist"
                className={cx(
                  'grid size-8 place-items-center border transition-colors',
                  saved ? 'border-gold/60 text-gold' : 'border-ivory/12 text-ivory/40 hover:text-ivory',
                )}
              >
                <Heart className={cx('size-3.5', saved && 'fill-gold')} />
              </button>
            </div>
          </div>
          <p className="mt-1.5 line-clamp-1 text-xs text-ivory/40">{watch.shortDescription}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {settings.showPrices && (
              <span className="text-sm text-ivory">
                {money(watch.price, watch.currency)}
                {watch.compareAtPrice && (
                  <span className="ml-2 text-[11px] text-ivory/30 line-through">
                    {money(watch.compareAtPrice, watch.currency)}
                  </span>
                )}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-[0.16em] text-ivory/35">
              {[watch.movement, watch.caseSize ? `${watch.caseSize} mm` : '', watch.availability]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.35), ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <div className="relative">
        <Link
          to={`/watch/${watch.slug}`}
          className="relative block aspect-[4/5] overflow-hidden bg-surface-2"
          aria-label={`${watch.brand} ${watch.name}`}
        >
          {!loaded && <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />}
          <img
            src={watch.images[0]}
            alt={`${watch.brand} ${watch.name}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cx(
              'size-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]',
              loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md',
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10 opacity-70 transition-opacity duration-500 group-hover:opacity-95" />

          {/* badges */}
          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {watch.badge && (
              <span className="bg-gold px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-ink uppercase">
                {watch.badge}
              </span>
            )}
            {discount && (
              <span className="bg-black/65 px-2 py-1 text-[9px] font-medium tracking-[0.12em] text-gold-soft uppercase backdrop-blur-sm">
                −{discount}%
              </span>
            )}
          </div>

          {/* availability */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5">
            <span
              className={cx(
                'size-1.5 rounded-full',
                watch.availability === 'In Showroom'
                  ? 'bg-emerald-400'
                  : watch.availability === 'Reserved'
                    ? 'bg-amber-400'
                    : watch.availability === 'Made to Order'
                      ? 'bg-sky-400'
                      : 'bg-rose-400',
              )}
            />
            <span className="text-[9px] font-medium tracking-[0.16em] text-ivory/75 uppercase">
              {watch.availability}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center pb-[52px] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex items-center gap-2 border border-ivory/25 bg-black/45 px-4 py-2 text-[9px] font-medium tracking-[0.2em] text-ivory uppercase backdrop-blur-md">
              View piece <ArrowUpRight className="size-3" />
            </span>
          </div>
        </Link>

        {/* quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => shortlist.toggle(watch.id)}
            aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}
            aria-pressed={saved}
            className={cx(
              'grid size-8 place-items-center border backdrop-blur-md transition-all duration-300',
              saved
                ? 'border-gold/70 bg-gold/15 text-gold'
                : 'border-white/15 bg-black/35 text-ivory/70 hover:border-white/40 hover:text-ivory',
            )}
          >
            <Heart className={cx('size-3.5 transition-transform', saved && 'scale-110 fill-gold')} />
          </button>
          <button
            onClick={() => compare.toggle(watch.id)}
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
            aria-pressed={comparing}
            className={cx(
              'grid size-8 place-items-center border backdrop-blur-md transition-all duration-300',
              comparing
                ? 'border-gold/70 bg-gold/15 text-gold'
                : 'border-white/15 bg-black/35 text-ivory/70 opacity-100 hover:border-white/40 hover:text-ivory sm:opacity-0 sm:group-hover:opacity-100',
            )}
          >
            <Scale className="size-3.5" />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(watch)}
              aria-label="Quick view"
              className="hidden size-8 place-items-center border border-white/15 bg-black/35 text-ivory/70 opacity-0 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:text-ivory group-hover:opacity-100 sm:grid"
            >
              <ArrowUpRight className="size-3.5 rotate-45" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-medium tracking-[0.22em] text-gold/60 uppercase">{watch.brand}</p>
            <Link to={`/watch/${watch.slug}`} className="mt-1 block">
              <h3 className="truncate text-[15px] font-normal tracking-wide text-ivory transition-colors duration-300 group-hover:text-gold-soft">
                {watch.name}
              </h3>
            </Link>
          </div>
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] text-ivory/32">
          {[watch.collection, watch.reference].filter(Boolean).join(' · ')}
        </p>
        {settings.showPrices && (
          <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
            <span className="text-[15px] font-medium tracking-wide text-ivory">
              {money(watch.price, watch.currency)}
            </span>
            {watch.compareAtPrice && watch.compareAtPrice > watch.price && (
              <span className="text-[11px] text-ivory/28 line-through">
                {money(watch.compareAtPrice, watch.currency)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
});
