import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Watch } from '../../lib/types';
import { cx, money, timeAgo } from '../../lib/format';
import { useToast } from '../../lib/store';
import { Button, Modal, Skeleton } from '../../components/ui';

type StatusFilter = 'all' | 'published' | 'drafts' | 'featured';

export function WatchesAdmin() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState<Watch | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { push } = useToast();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api
      .watches({ includeUnpublished: true, limit: 120, sort: 'curated' })
      .then((r) => setWatches(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    return watches.filter((w) => {
      const matchesTerm =
        !q ||
        `${w.brand} ${w.name} ${w.reference} ${w.category} ${w.tags.join(' ')}`.toLowerCase().includes(q);
      const matchesStatus =
        status === 'all' ||
        (status === 'published' && w.published) ||
        (status === 'drafts' && !w.published) ||
        (status === 'featured' && w.featured);
      return matchesTerm && matchesStatus;
    });
  }, [watches, term, status]);

  const toggle = async (watch: Watch, field: 'published' | 'featured') => {
    setBusyId(watch.id);
    try {
      const { watch: updated } = await api.patchWatch(watch.id, { [field]: !watch[field] });
      setWatches((list) => list.map((w) => (w.id === updated.id ? updated : w)));
      push({
        title:
          field === 'published'
            ? updated.published
              ? 'Published to the catalogue'
              : 'Moved to drafts'
            : updated.featured
              ? 'Added to the Edit'
              : 'Removed from the Edit',
        tone: 'success',
      });
    } catch (error) {
      push({ title: error instanceof ApiError ? error.message : 'Update failed', tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (watch: Watch) => {
    setBusyId(watch.id);
    try {
      await api.duplicateWatch(watch.id);
      load();
      push({ title: 'Duplicated as a draft', tone: 'success' });
    } catch {
      push({ title: 'Could not duplicate', tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    try {
      await api.deleteWatch(confirmDelete.id);
      setWatches((list) => list.filter((w) => w.id !== confirmDelete.id));
      push({ title: 'Watch deleted', tone: 'success' });
    } catch {
      push({ title: 'Could not delete', tone: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ivory/30" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by name, brand or reference…"
            className="w-full border border-ivory/12 bg-white/[0.02] py-2.5 pr-3 pl-9 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
          />
          {term && (
            <button
              onClick={() => setTerm('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-ivory/30 hover:text-ivory"
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'published', 'drafts', 'featured'] as StatusFilter[]).map((option) => (
            <button
              key={option}
              onClick={() => setStatus(option)}
              className={cx(
                'border px-3 py-2 text-[10px] tracking-[0.14em] uppercase transition-colors',
                status === option
                  ? 'border-gold/50 bg-gold/10 text-gold-soft'
                  : 'border-ivory/12 text-ivory/40 hover:text-ivory/70',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-ivory/10">
        <div className="hidden grid-cols-[1fr_120px_100px_90px_120px] gap-4 border-b border-ivory/10 bg-white/[0.02] px-4 py-2.5 text-[9px] tracking-[0.18em] text-ivory/30 uppercase md:grid">
          <span>Piece</span>
          <span>Price</span>
          <span>Status</span>
          <span>Views</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-[12px] text-ivory/45">No watches match this view.</p>
            <Link to="/admin/watches/new" className="mt-4">
              <Button size="sm" icon={<Plus className="size-3.5" />}>
                Add a watch
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ivory/8">
            {filtered.map((watch) => (
              <li
                key={watch.id}
                className={cx(
                  'grid grid-cols-[auto_1fr] items-center gap-3 px-3 py-3 transition-colors hover:bg-white/[0.02] md:grid-cols-[1fr_120px_100px_90px_120px] md:gap-4 md:px-4',
                  busyId === watch.id && 'opacity-50',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden bg-surface-2">
                    {watch.images[0] ? (
                      <img src={watch.images[0]} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-[8px] text-ivory/20">No img</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/admin/watches/${watch.id}`}
                      className="flex items-center gap-1.5 truncate text-[12px] text-ivory hover:text-gold"
                    >
                      {watch.featured && <Star className="size-2.5 shrink-0 fill-gold text-gold" />}
                      {watch.brand} {watch.name}
                    </Link>
                    <p className="truncate text-[10px] text-ivory/30">
                      {watch.reference || watch.category} · {timeAgo(watch.updatedAt)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                      <span className="text-[9px] text-ivory/50">{money(watch.price, watch.currency)}</span>
                      <span className="text-ivory/15">·</span>
                      <span className={watch.published ? 'text-emerald-300/70 text-[9px]' : 'text-amber-300/70 text-[9px]'}>
                        {watch.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="hidden text-[11px] text-ivory/60 md:block">{money(watch.price, watch.currency)}</span>

                <div className="hidden md:block">
                  <button
                    onClick={() => toggle(watch, 'published')}
                    className={cx(
                      'inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] tracking-[0.12em] uppercase transition-colors',
                      watch.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-200/80'
                        : 'border-amber-400/25 bg-amber-400/8 text-amber-200/80',
                    )}
                  >
                    <span className={cx('size-1.5 rounded-full', watch.published ? 'bg-emerald-400' : 'bg-amber-400')} />
                    {watch.published ? 'Live' : 'Draft'}
                  </button>
                </div>

                <span className="hidden items-center gap-1 text-[10px] text-ivory/35 md:flex">
                  <Eye className="size-3" /> {watch.views}
                </span>

                <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                  <IconButton
                    label={watch.published ? 'Unpublish' : 'Publish'}
                    onClick={() => toggle(watch, 'published')}
                  >
                    {watch.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </IconButton>
                  <IconButton
                    label={watch.featured ? 'Remove from featured' : 'Feature'}
                    onClick={() => toggle(watch, 'featured')}
                  >
                    <Star className={cx('size-3.5', watch.featured && 'fill-gold text-gold')} />
                  </IconButton>
                  <IconButton label="Edit" onClick={() => navigate(`/admin/watches/${watch.id}`)}>
                    <Pencil className="size-3.5" />
                  </IconButton>
                  <IconButton label="Duplicate" onClick={() => duplicate(watch)}>
                    <Copy className="size-3.5" />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => setConfirmDelete(watch)}>
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] text-ivory/25">
        Showing {filtered.length} of {watches.length} pieces · drafts are hidden from the public catalogue
      </p>

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Delete this watch?">
        <p className="text-xs leading-relaxed text-ivory/50">
          <span className="text-ivory">
            {confirmDelete?.brand} {confirmDelete?.name}
          </span>{' '}
          will be permanently removed from the catalogue. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} icon={<Trash2 className="size-3.5" />}>
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cx(
        'grid size-7 place-items-center border border-transparent text-ivory/35 transition-colors hover:border-ivory/15 hover:text-ivory',
        danger && 'hover:border-rose-400/30 hover:text-rose-300',
      )}
    >
      {children}
    </button>
  );
}
