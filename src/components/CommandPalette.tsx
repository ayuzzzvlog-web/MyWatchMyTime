import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { api } from '../lib/api';
import type { Watch } from '../lib/types';
import { money } from '../lib/format';
import { useSettings } from '../lib/store';

const PAGES = [
  { label: 'The Collection', to: '/collection', hint: 'Browse every piece' },
  { label: 'New Arrivals', to: '/collection?sort=newest', hint: 'Recently added' },
  { label: 'The House', to: '/about', hint: 'Our story' },
  { label: 'Book a viewing', to: '/contact', hint: 'Visit the showroom' },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTerm('');
      setResults([]);
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .watches({ q: term, limit: 5 })
        .then((r) => setResults(r.items))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(timer);
  }, [term, open]);

  const options: { key: string; label: string; sub: string; image?: string; action: () => void }[] = [
    ...results.map((w) => ({
      key: w.id,
      label: `${w.brand} ${w.name}`,
      sub: `${w.reference} · ${money(w.price, w.currency)}`,
      image: w.images[0] as string | undefined,
      action: () => navigate(`/watch/${w.slug}`),
    })),
    ...PAGES.filter((p) => p.label.toLowerCase().includes(term.toLowerCase()))
      .slice(0, term ? 3 : 4)
      .map((p) => ({ key: p.to, label: p.label, sub: p.hint, action: () => navigate(p.to) })),
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(options.length - 1, c + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      }
      if (e.key === 'Enter' && options[cursor]) {
        e.preventDefault();
        options[cursor].action();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, options, cursor, onClose]);

  useEffect(() => setCursor(0), [term]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-[4px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl border border-ivory/14 bg-[#0b0b0e]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-center gap-3 border-b border-ivory/10 px-4">
              <Search className="size-4 shrink-0 text-ivory/35" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={`Search ${settings.brandName}…`}
                className="h-14 flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/25 focus:outline-none"
              />
              <button onClick={onClose} className="text-ivory/30 hover:text-ivory" aria-label="Close search">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {loading && <p className="px-3 py-4 text-xs text-ivory/30">Searching…</p>}
              {!loading && !options.length && (
                <p className="px-3 py-8 text-center text-xs text-ivory/30">
                  Nothing found for “{term}”. Try a brand, reference or category.
                </p>
              )}
              {options.map((option, index) => (
                <button
                  key={option.key}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => {
                    option.action();
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    cursor === index ? 'bg-white/[0.05]' : ''
                  }`}
                >
                  {option.image ? (
                    <img src={option.image} alt="" className="size-9 shrink-0 object-cover" />
                  ) : (
                    <span className="grid size-9 shrink-0 place-items-center border border-ivory/10 text-ivory/30">
                      <ArrowRight className="size-3.5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ivory">{option.label}</span>
                    <span className="block truncate text-[10px] text-ivory/35">{option.sub}</span>
                  </span>
                  {cursor === index && <CornerDownLeft className="size-3 shrink-0 text-gold/70" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-ivory/10 px-4 py-2.5 text-[9px] tracking-[0.14em] text-ivory/25 uppercase">
              <span>↑ ↓ to navigate</span>
              <span>↵ to open</span>
              <span className="ml-auto">esc to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
