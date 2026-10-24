import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import type { Watch } from '../lib/types';
import { cx, money, specRows } from '../lib/format';
import { useCompare, useSettings } from '../lib/store';
import { Button, Drawer } from './ui';

export function CompareDrawer() {
  const { ids, open, setOpen, remove, clear } = useCompare();
  const { settings } = useSettings();
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setWatches([]);
      return;
    }
    Promise.all(ids.map((id) => api.watch(id).then((r) => r.watch).catch(() => null))).then((list) =>
      setWatches(list.filter((w): w is Watch => Boolean(w))),
    );
  }, [ids]);

  const labels = Array.from(new Set(watches.flatMap((w) => specRows(w).map((r) => r.label))));

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="Compare"
      subtitle={watches.length ? `${watches.length} of 3 pieces selected` : 'Add up to three pieces'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button onClick={clear} className="text-[10px] tracking-[0.18em] text-ivory/35 uppercase hover:text-ivory">
            Clear all
          </button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      }
    >
      {!watches.length ? (
        <p className="py-10 text-center text-xs leading-relaxed text-ivory/35">
          Nothing to compare yet.
          <br />
          Tap the <span className="text-gold">scale icon</span> on any piece.
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-24 pb-3" />
                {watches.map((w) => (
                  <th key={w.id} className="pb-3 align-top">
                    <div className="relative mb-2">
                      <Link to={`/watch/${w.slug}`} onClick={() => setOpen(false)}>
                        <img src={w.images[0]} alt={w.name} className="aspect-square w-full object-cover" />
                      </Link>
                      <button
                        onClick={() => remove(w.id)}
                        aria-label="Remove"
                        className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-ivory/20 bg-ink text-ivory/60 hover:text-ivory"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                    <p className="text-[9px] tracking-[0.16em] text-gold/65 uppercase">{w.brand}</p>
                    <p className="text-[12px] leading-tight text-ivory">{w.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settings.showPrices && (
                <tr className="border-t border-ivory/8">
                  <td className="py-2.5 pr-2 text-[9px] tracking-[0.14em] text-ivory/35 uppercase">Price</td>
                  {watches.map((w) => (
                    <td key={w.id} className="py-2.5 pr-2 text-[12px] text-gold-soft">
                      {money(w.price, w.currency)}
                    </td>
                  ))}
                </tr>
              )}
              {labels.map((label) => {
                const values = watches.map((w) => specRows(w).find((r) => r.label === label)?.value || '—');
                const allSame = values.every((v) => v === values[0]);
                return (
                  <tr key={label} className="border-t border-ivory/8">
                    <td className="py-2.5 pr-2 align-top text-[9px] tracking-[0.14em] text-ivory/35 uppercase">
                      {label}
                    </td>
                    {values.map((value, i) => (
                      <td
                        key={`${label}-${i}`}
                        className={cx('py-2.5 pr-2 text-[11px] leading-snug', allSame ? 'text-ivory/45' : 'text-ivory')}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
}
