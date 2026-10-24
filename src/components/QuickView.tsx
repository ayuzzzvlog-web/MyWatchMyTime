import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Scale } from 'lucide-react';
import type { Watch } from '../lib/types';
import { cx, discountPercent, money } from '../lib/format';
import { useCompare, useSettings, useShortlist } from '../lib/store';
import { Badge, Button, Modal } from './ui';
import { useShell } from './AppShell';

export function QuickView({ watch, onClose }: { watch: Watch | null; onClose: () => void }) {
  const { settings } = useSettings();
  const shortlist = useShortlist();
  const compare = useCompare();
  const { openEnquiry } = useShell();
  const discount = watch ? discountPercent(watch.price, watch.compareAtPrice) : null;

  return (
    <Modal open={Boolean(watch)} onClose={onClose} wide bare>
      {watch && (
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface md:aspect-auto md:min-h-[540px]">
            <img src={watch.images[0]} alt={watch.name} className="size-full object-cover" />
            {watch.badge && (
              <span className="absolute top-4 left-4 bg-gold px-2.5 py-1 text-[9px] font-semibold tracking-[0.16em] text-ink uppercase">
                {watch.badge}
              </span>
            )}
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-[10px] tracking-[0.26em] text-gold/75 uppercase">{watch.brand}</p>
            <h2 className="display mt-2 text-4xl text-ivory">{watch.name}</h2>
            <p className="mt-1 text-[11px] tracking-[0.14em] text-ivory/35 uppercase">
              {[watch.collection, watch.reference].filter(Boolean).join(' · ')}
            </p>

            {settings.showPrices && (
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-xl text-ivory">{money(watch.price, watch.currency)}</span>
                {watch.compareAtPrice && watch.compareAtPrice > watch.price && (
                  <>
                    <span className="text-sm text-ivory/30 line-through">
                      {money(watch.compareAtPrice, watch.currency)}
                    </span>
                    {discount && <Badge tone="gold">−{discount}%</Badge>}
                  </>
                )}
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-ivory/50">{watch.shortDescription}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ivory/10 pt-5">
              {[
                ['Movement', watch.movement],
                ['Case', watch.caseMaterial],
                ['Size', watch.caseSize ? `${watch.caseSize} mm` : '—'],
                ['Dial', watch.dialColor],
                ['Strap', watch.strap],
                ['Water resistance', watch.waterResistance],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[9px] tracking-[0.18em] text-ivory/30 uppercase">{label}</dt>
                  <dd className="mt-0.5 text-[12px] text-ivory/80">{value || '—'}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto space-y-3 pt-7">
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { onClose(); openEnquiry(watch, 'enquiry'); }}>
                  Enquire
                </Button>
                <Link to={`/watch/${watch.slug}`} onClick={onClose} className="flex-1">
                  <Button variant="outline" className="w-full" iconRight={<ArrowRight className="size-3.5" />}>
                    Full details
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => shortlist.toggle(watch.id)}
                  className={cx(
                    'flex h-10 flex-1 items-center justify-center gap-2 border text-[10px] tracking-[0.18em] uppercase transition-colors',
                    shortlist.has(watch.id)
                      ? 'border-gold/60 text-gold'
                      : 'border-ivory/12 text-ivory/45 hover:text-ivory',
                  )}
                >
                  <Heart className={cx('size-3.5', shortlist.has(watch.id) && 'fill-gold')} />
                  {shortlist.has(watch.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => compare.toggle(watch.id)}
                  className={cx(
                    'flex h-10 flex-1 items-center justify-center gap-2 border text-[10px] tracking-[0.18em] uppercase transition-colors',
                    compare.has(watch.id)
                      ? 'border-gold/60 text-gold'
                      : 'border-ivory/12 text-ivory/45 hover:text-ivory',
                  )}
                >
                  <Scale className="size-3.5" />
                  {compare.has(watch.id) ? 'Comparing' : 'Compare'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
