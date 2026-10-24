import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Watch } from '../lib/types';
import { money } from '../lib/format';
import { useSettings, useShortlist } from '../lib/store';
import { Button, Drawer } from './ui';

export function ShortlistDrawer({ onEnquire }: { onEnquire: () => void }) {
  const { ids, open, setOpen, remove, clear } = useShortlist();
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

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="Your shortlist"
      subtitle={
        watches.length
          ? `${watches.length} piece${watches.length > 1 ? 's' : ''} saved on this device`
          : 'Saved on this device only'
      }
      footer={
        watches.length ? (
          <div className="space-y-3">
            <Button className="w-full" onClick={onEnquire}>
              Enquire about these
            </Button>
            <button
              onClick={clear}
              className="mx-auto block text-[10px] tracking-[0.18em] text-ivory/30 uppercase hover:text-ivory/70"
            >
              Clear shortlist
            </button>
          </div>
        ) : null
      }
    >
      {!watches.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Heart className="size-8 text-ivory/15" />
          <p className="mt-4 text-xs leading-relaxed text-ivory/35">
            Your shortlist is empty.
            <br />
            Save pieces as you browse to compare them later.
          </p>
          <Link to="/collection" onClick={() => setOpen(false)} className="mt-5">
            <Button variant="outline" size="sm">
              Browse the collection
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {watches.map((watch) => (
            <li key={watch.id} className="flex gap-3 border-b border-ivory/8 pb-4">
              <Link to={`/watch/${watch.slug}`} onClick={() => setOpen(false)} className="shrink-0">
                <img src={watch.images[0]} alt={watch.name} className="size-20 object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] tracking-[0.18em] text-gold/65 uppercase">{watch.brand}</p>
                <Link
                  to={`/watch/${watch.slug}`}
                  onClick={() => setOpen(false)}
                  className="block truncate text-sm text-ivory hover:text-gold-soft"
                >
                  {watch.name}
                </Link>
                <p className="mt-0.5 text-[10px] text-ivory/30">{watch.reference}</p>
                {settings.showPrices && (
                  <p className="mt-1.5 text-xs text-ivory/70">{money(watch.price, watch.currency)}</p>
                )}
              </div>
              <button
                onClick={() => remove(watch.id)}
                aria-label="Remove from shortlist"
                className="self-start text-ivory/25 transition-colors hover:text-rose-300"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
