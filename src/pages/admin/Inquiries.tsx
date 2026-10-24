import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Mail, MessageSquare, Phone, Search, Trash2, X } from 'lucide-react';
import { api, tokenStore } from '../../lib/api';
import type { Inquiry } from '../../lib/types';
import { cx, timeAgo } from '../../lib/format';
import { useToast } from '../../lib/store';
import { Button, Skeleton } from '../../components/ui';

const STATUSES = ['all', 'new', 'contacted', 'closed'] as const;
type Status = (typeof STATUSES)[number];

const TYPE_LABEL: Record<Inquiry['type'], string> = {
  viewing: 'Viewing',
  enquiry: 'Enquiry',
  price: 'Pricing',
  general: 'General',
};

export function Inquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>('all');
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [note, setNote] = useState('');
  const { push } = useToast();

  const load = () =>
    api
      .inquiries()
      .then((r) => setItems(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (selected) setNote(selected.note || '');
  }, [selected]);

  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    return items.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesTerm =
        !q ||
        `${item.name} ${item.phone} ${item.email} ${item.message} ${item.watchName || ''}`
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesTerm;
    });
  }, [items, status, term]);

  const update = async (id: string, body: { status?: string; note?: string }) => {
    try {
      const { inquiry } = await api.updateInquiry(id, body);
      setItems((list) => list.map((i) => (i.id === inquiry.id ? inquiry : i)));
      if (selected?.id === inquiry.id) setSelected(inquiry);
      push({ title: 'Enquiry updated', tone: 'success' });
    } catch {
      push({ title: 'Could not update', tone: 'error' });
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteInquiry(id);
      setItems((list) => list.filter((i) => i.id !== id));
      setSelected(null);
      push({ title: 'Enquiry deleted', tone: 'success' });
    } catch {
      push({ title: 'Could not delete', tone: 'error' });
    }
  };

  const exportCsv = async () => {
    try {
      const res = await fetch('/api/inquiries/export.csv', {
        headers: { Authorization: `Bearer ${tokenStore.get()}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unique-trendz-enquiries.csv';
      a.click();
      URL.revokeObjectURL(url);
      push({ title: 'CSV downloaded', tone: 'success' });
    } catch {
      push({ title: 'Export failed', tone: 'error' });
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
            placeholder="Search enquiries…"
            className="w-full border border-ivory/12 bg-white/[0.02] py-2.5 pr-3 pl-9 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUSES.map((option) => (
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
        <Button variant="dark" size="sm" onClick={exportCsv} icon={<Download className="size-3" />}>
          CSV
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-ivory/12 py-20 text-center">
          <Mail className="mx-auto size-6 text-ivory/20" />
          <p className="mt-4 text-[12px] text-ivory/45">No enquiries here yet.</p>
          <p className="mt-1 text-[10px] text-ivory/25">
            Submissions from the enquiry forms will appear in this inbox.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-ivory/8 border border-ivory/10">
          {filtered.map((item) => (
            <li
              key={item.id}
              onClick={() => setSelected(item)}
              className={cx(
                'cursor-pointer px-4 py-3.5 transition-colors hover:bg-white/[0.02]',
                item.status === 'new' && 'border-l-2 border-l-gold/60',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[12px] text-ivory">{item.name}</span>
                <span className="border border-ivory/12 px-1.5 py-0.5 text-[8px] tracking-[0.14em] text-ivory/40 uppercase">
                  {TYPE_LABEL[item.type]}
                </span>
                {item.watchName && (
                  <span className="text-[10px] text-gold/60">{item.watchName}</span>
                )}
                <span className="ml-auto text-[10px] text-ivory/25">{timeAgo(item.createdAt)}</span>
              </div>
              <p className="mt-1 line-clamp-1 text-[11px] text-ivory/40">{item.message || '—'}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-ivory/30">
                <span className="flex items-center gap-1">
                  <Phone className="size-2.5" /> {item.phone}
                </span>
                {item.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-2.5" /> {item.email}
                  </span>
                )}
                <span
                  className={cx(
                    'ml-auto px-1.5 py-0.5 text-[8px] tracking-[0.14em] uppercase',
                    item.status === 'new'
                      ? 'bg-gold/15 text-gold-soft'
                      : item.status === 'contacted'
                        ? 'bg-sky-400/10 text-sky-200/80'
                        : 'bg-ivory/8 text-ivory/40',
                  )}
                >
                  {item.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* detail panel */}
      {selected && (
        <div className="fixed inset-0 z-[85] flex justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative flex h-full w-full max-w-lg flex-col border-l border-ivory/10 bg-[#0a0a0d]">
            <div className="flex items-start justify-between border-b border-ivory/10 px-5 py-4">
              <div>
                <p className="text-[9px] tracking-[0.2em] text-gold/70 uppercase">
                  {TYPE_LABEL[selected.type]} · {timeAgo(selected.createdAt)}
                </p>
                <h2 className="mt-1.5 text-lg text-ivory">{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="grid size-8 place-items-center border border-ivory/15 text-ivory/50 hover:text-ivory"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-2 border border-ivory/10 p-3 text-[11px] text-ivory/70 hover:border-gold/40 hover:text-gold"
                >
                  <Phone className="size-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 border border-ivory/10 p-3 text-[11px] text-ivory/70 hover:border-[#25D366]/50 hover:text-[#25D366]"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp
                </a>
              </div>

              <div className="space-y-1.5 border border-ivory/10 bg-white/[0.015] p-4 text-[11px]">
                <p className="text-ivory/30">Phone</p>
                <p className="text-ivory/80">{selected.phone}</p>
                {selected.email && (
                  <>
                    <p className="pt-2 text-ivory/30">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-ivory/80 hover:text-gold">
                      {selected.email}
                    </a>
                  </>
                )}
                {selected.watchName && (
                  <>
                    <p className="pt-2 text-ivory/30">Regarding</p>
                    {selected.watchId ? (
                      <Link
                        to={`/admin/watches/${selected.watchId}`}
                        className="text-gold/80 hover:text-gold"
                      >
                        {selected.watchName}
                      </Link>
                    ) : (
                      <p className="text-ivory/80">{selected.watchName}</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] text-ivory/30 uppercase">Message</p>
                <p className="mt-2 whitespace-pre-line border-l border-gold/25 pl-3 text-xs leading-relaxed text-ivory/65">
                  {selected.message || 'No message provided.'}
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] text-ivory/30 uppercase">Internal note</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Called on Tuesday, wants photos of the clasp…"
                  className="mt-2 w-full border border-ivory/12 bg-white/[0.02] px-3 py-2 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
                />
                <Button
                  size="sm"
                  variant="dark"
                  className="mt-2"
                  onClick={() => update(selected.id, { note })}
                >
                  Save note
                </Button>
              </div>
            </div>

            <div className="border-t border-ivory/10 px-5 py-4">
              <p className="mb-2 text-[9px] tracking-[0.18em] text-ivory/30 uppercase">Status</p>
              <div className="flex gap-1.5">
                {(['new', 'contacted', 'closed'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => update(selected.id, { status: option })}
                    className={cx(
                      'flex-1 border py-2 text-[10px] tracking-[0.14em] uppercase transition-colors',
                      selected.status === option
                        ? 'border-gold/50 bg-gold/10 text-gold-soft'
                        : 'border-ivory/12 text-ivory/40 hover:text-ivory/70',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={() => remove(selected.id)}
                className="mt-3 flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-ivory/25 uppercase hover:text-rose-300"
              >
                <Trash2 className="size-3" /> Delete enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
