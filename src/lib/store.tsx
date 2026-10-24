import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { Settings } from './types';

const FALLBACK_SETTINGS: Settings = {
  brandName: 'Unique Trendz',
  brandMark: 'UT',
  tagline: 'Curated Timepieces',
  announcement: 'Private viewings · Nationwide insured delivery',
  heroEyebrow: 'The 2026 Collection',
  heroTitle: 'Time, held still.',
  heroSubtitle: 'A hand-picked catalogue of remarkable watches.',
  heroImage: '/images/hero-watch.jpg',
  heroPrimaryCta: 'Explore the collection',
  heroSecondaryCta: 'Book a viewing',
  aboutHeading: 'Fewer watches. Better watches.',
  aboutText: '',
  viewingNote: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  hours: '',
  instagram: '',
  facebook: '',
  youtube: '',
  currency: 'INR',
  showPrices: true,
  footerNote: '',
};

/* ----------------------------- Settings ----------------------------- */
interface SettingsCtx {
  settings: Settings;
  loading: boolean;
  refresh: () => Promise<void>;
  setLocal: (next: Settings) => void;
}
const SettingsContext = createContext<SettingsCtx>({
  settings: FALLBACK_SETTINGS,
  loading: true,
  refresh: async () => {},
  setLocal: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { settings: fetched } = await api.settings();
      setSettings({ ...FALLBACK_SETTINGS, ...fetched });
      document.title = `${fetched.brandName} — ${fetched.tagline}`;
    } catch {
      /* keep fallbacks */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, loading, refresh, setLocal: setSettings }),
    [settings, loading, refresh],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export const useSettings = () => useContext(SettingsContext);

/* ------------------------------ Toasts ------------------------------ */
export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: 'default' | 'success' | 'error';
}
interface ToastCtx {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}
const ToastContext = createContext<ToastCtx>({ toasts: [], push: () => {}, dismiss: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4600);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);

/* ---------------------------- Shortlist ----------------------------- */
const SHORTLIST_KEY = 'ut_shortlist_v1';
interface ShortlistCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const ShortlistContext = createContext<ShortlistCtx>({
  ids: [],
  has: () => false,
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  open: false,
  setOpen: () => {},
});

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value = useMemo(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      toggle,
      remove: (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
      open,
      setOpen,
    }),
    [ids, open, toggle],
  );
  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}
export const useShortlist = () => useContext(ShortlistContext);

/* ----------------------------- Compare ------------------------------ */
const COMPARE_KEY = 'ut_compare_v1';
interface CompareCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const CompareContext = createContext<CompareCtx>({
  ids: [],
  has: () => false,
  toggle: () => false,
  remove: () => {},
  clear: () => {},
  open: false,
  setOpen: () => {},
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback(
    (id: string) => {
      let added = false;
      setIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 3) {
          push({ title: 'Compare holds three watches', description: 'Remove one to add another.', tone: 'error' });
          return prev;
        }
        added = true;
        return [...prev, id];
      });
      return added;
    },
    [push],
  );

  const value = useMemo(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      toggle,
      remove: (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
      open,
      setOpen,
    }),
    [ids, open, toggle],
  );
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export const useCompare = () => useContext(CompareContext);

/* ----------------------------- Media -------------------------------- */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}
