import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import {
  ArrowUp,
  Heart,
  AtSign,
  Menu,
  Phone,
  Scale,
  Search,
  X,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useCompare, useSettings, useShortlist } from '../lib/store';
import type { Watch } from '../lib/types';
import { cx } from '../lib/format';
import { Button } from './ui';
import { CommandPalette } from './CommandPalette';
import { ShortlistDrawer } from './ShortlistDrawer';
import { CompareDrawer } from './CompareDrawer';
import { EnquiryDialog } from './EnquiryDialog';
import { Toasts } from './Toasts';

/* --------------------------- Shell context -------------------------- */
interface ShellCtx {
  openEnquiry: (watch?: Watch | null, type?: 'viewing' | 'enquiry' | 'price' | 'general') => void;
  openSearch: () => void;
  openShortlist: () => void;
}
const ShellContext = createContext<ShellCtx>({
  openEnquiry: () => {},
  openSearch: () => {},
  openShortlist: () => {},
});
export const useShell = () => useContext(ShellContext);

const NAV = [
  { label: 'Collection', to: '/collection' },
  { label: 'New Arrivals', to: '/collection?sort=newest' },
  { label: 'The House', to: '/about' },
  { label: 'Visit', to: '/contact' },
];

/* ------------------------------- Logo ------------------------------- */
function Wordmark({ compact = false }: { compact?: boolean }) {
  const { settings } = useSettings();
  return (
    <span className="flex items-center gap-3">
      <span className="relative grid size-9 place-items-center border border-gold/45">
        <span className="absolute inset-[3px] border border-gold/15" />
        <span className="display text-[15px] leading-none tracking-tight text-gold-soft">
          {settings.brandMark || 'UT'}
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[13px] font-medium tracking-[0.28em] text-ivory uppercase">
            {settings.brandName}
          </span>
          <span className="mt-1 block text-[8px] tracking-[0.32em] text-ivory/35 uppercase">
            {settings.tagline}
          </span>
        </span>
      )}
    </span>
  );
}

/* ------------------------------- Nav -------------------------------- */
function Header({ onSearch }: { onSearch: () => void }) {
  const { settings } = useSettings();
  const shortlist = useShortlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <div className="relative z-50 overflow-hidden border-b border-white/5 bg-[#070709]">
        <div className="flex h-9 items-center overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap will-change-transform">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center">
                {[
                  settings.announcement,
                  'Complimentary insured delivery across India',
                  'Authenticity guaranteed on every reference',
                  'Private appointments · Boring Road, Patna',
                ].map((text, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-6 text-[9px] tracking-[0.26em] text-ivory/45 uppercase">{text}</span>
                    <span className="size-1 rotate-45 bg-gold/50" aria-hidden />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <header
        className={cx(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-ivory/8 bg-[#08080a]/88 backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-[#08080a] to-transparent',
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 sm:px-8">
          <Link to="/" className="shrink-0">
            <Wordmark />
          </Link>

          <nav className="ml-6 hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    'link-draw text-[11px] font-medium tracking-[0.2em] uppercase transition-colors duration-300',
                    isActive ? 'text-gold-soft' : 'text-ivory/60 hover:text-ivory',
                  )
                }
                data-active={
                  item.to === '/collection'
                    ? location.pathname.startsWith('/watch') || location.pathname === '/collection'
                    : location.pathname === item.to
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onSearch}
              aria-label="Search"
              className="group flex items-center gap-2 px-2.5 py-2 text-ivory/60 transition-colors hover:text-gold"
            >
              <Search className="size-[17px]" />
              <span className="hidden text-[9px] tracking-[0.16em] text-ivory/25 uppercase xl:inline">⌘K</span>
            </button>
            <button
              onClick={() => shortlist.setOpen(true)}
              aria-label="Shortlist"
              className="relative px-2.5 py-2 text-ivory/60 transition-colors hover:text-gold"
            >
              <Heart className="size-[17px]" />
              {shortlist.ids.length > 0 && (
                <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-gold text-[8px] font-bold text-ink">
                  {shortlist.ids.length}
                </span>
              )}
            </button>
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              aria-label="Call us"
              className="hidden px-2.5 py-2 text-ivory/60 transition-colors hover:text-gold sm:block"
            >
              <Phone className="size-[17px]" />
            </a>
            <div className="mx-2 hidden h-5 w-px bg-ivory/12 sm:block" />
            <Link to="/contact" className="hidden sm:block">
              <Button size="sm" variant="outline" className="h-9 px-4">
                Book a viewing
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ml-1 px-2 py-2 text-ivory/70 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 flex h-full w-[84%] max-w-sm flex-col border-l border-ivory/10 bg-[#0a0a0d]"
            >
              <div className="flex items-center justify-between border-b border-ivory/10 px-6 py-5">
                <Wordmark />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-ivory/50">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col px-6 py-6">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between border-b border-ivory/8 py-4"
                    >
                      <span className="display text-3xl font-light text-ivory">{item.label}</span>
                      <ArrowRight className="size-4 text-gold/50" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-4 px-6 pb-8">
                <Link to="/contact" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Book a viewing</Button>
                </Link>
                <div className="space-y-1.5 text-[11px] text-ivory/40">
                  <p className="flex items-center gap-2">
                    <Phone className="size-3" /> {settings.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-3" /> {settings.hours}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------- Footer ----------------------------- */
function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-ivory/8 bg-[#060608]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-xs leading-relaxed text-ivory/40">
              {settings.aboutText.slice(0, 190)}
              {settings.aboutText.length > 190 ? '…' : ''}
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: settings.instagram, label: 'Instagram', icon: AtSign },
                { href: `https://wa.me/${settings.whatsapp}`, label: 'WhatsApp', icon: Phone },
              ]
                .filter((s) => s.href)
                .map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid size-9 place-items-center border border-ivory/12 text-ivory/45 transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <social.icon className="size-3.5" />
                  </a>
                ))}
            </div>
          </div>

          <div>
            <h3 className="label mb-4 text-[9px] text-gold/70">Explore</h3>
            <ul className="space-y-2.5 text-xs text-ivory/45">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/collection?category=Dive" className="transition-colors hover:text-ivory">
                  Dive watches
                </Link>
              </li>
              <li>
                <Link to="/collection?category=Dress" className="transition-colors hover:text-ivory">
                  Dress watches
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label mb-4 text-[9px] text-gold/70">The House</h3>
            <ul className="space-y-2.5 text-xs text-ivory/45">
              <li>
                <Link to="/about" className="transition-colors hover:text-ivory">
                  Our story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-ivory">
                  Book a viewing
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-ivory">
                  Curator login
                </Link>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-ivory">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label mb-4 text-[9px] text-gold/70">The Showroom</h3>
            <address className="space-y-1 text-xs leading-relaxed text-ivory/45 not-italic">
              <p>{settings.address}</p>
              <p className="pt-1">{settings.hours}</p>
              <p className="text-ivory/70">{settings.phone}</p>
            </address>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-gold uppercase">
              Get directions <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="hairline my-10 opacity-40" />

        <div className="flex flex-col items-start justify-between gap-4 text-[10px] text-ivory/25 sm:flex-row sm:items-center">
          <p>
            © {year} {settings.brandName}. All rights reserved.
          </p>
          <p className="max-w-lg text-center text-[10px] leading-relaxed sm:text-right">{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------- Compare bar --------------------------- */
function CompareBar() {
  const { ids, setOpen, clear } = useCompare();
  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-gold/25 bg-[#0a0a0d]/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-3 sm:px-8">
            <Scale className="hidden size-4 text-gold sm:block" />
            <p className="text-[10px] tracking-[0.18em] text-ivory/50 uppercase">
              {ids.length} selected
              <span className="hidden text-ivory/25 sm:inline"> · compare up to 3</span>
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={clear}
                className="px-2 text-[10px] tracking-[0.16em] text-ivory/35 uppercase hover:text-ivory"
              >
                Clear
              </button>
              <Button size="sm" onClick={() => setOpen(true)} disabled={ids.length < 2}>
                Compare {ids.length < 2 ? '· pick 2+' : ''}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------- Back to top --------------------------- */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed right-4 bottom-20 z-[75] grid size-10 place-items-center border border-ivory/15 bg-[#0a0a0d]/90 text-ivory/60 backdrop-blur transition-colors hover:border-gold/60 hover:text-gold sm:right-6"
        >
          <ArrowUp className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Shell ------------------------------- */
export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryWatch, setEnquiryWatch] = useState<Watch | null>(null);
  const [enquiryType, setEnquiryType] = useState<'viewing' | 'enquiry' | 'price' | 'general'>('enquiry');
  const shortlist = useShortlist();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  const openEnquiry = useCallback(
    (watch?: Watch | null, type: 'viewing' | 'enquiry' | 'price' | 'general' = 'enquiry') => {
      setEnquiryWatch(watch ?? null);
      setEnquiryType(type);
      setEnquiryOpen(true);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(
    () => ({ openEnquiry, openSearch: () => setSearchOpen(true), openShortlist: () => shortlist.setOpen(true) }),
    [openEnquiry, shortlist],
  );

  return (
    <ShellContext.Provider value={value}>
      <div className="grain relative flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[110] focus:border focus:border-gold/60 focus:bg-ink focus:px-4 focus:py-2 focus:text-[10px] focus:tracking-[0.2em] focus:text-gold focus:uppercase"
        >
          Skip to content
        </a>
        <motion.div
          style={{ scaleX: progress }}
          className="fixed top-0 right-0 left-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-soft"
        />
        <Header onSearch={() => setSearchOpen(true)} />
        <main id="content" className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <CompareBar />
        <BackToTop />
        <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        <ShortlistDrawer
          onEnquire={() => {
            shortlist.setOpen(false);
            window.setTimeout(() => openEnquiry(null, 'enquiry'), 260);
          }}
        />
        <CompareDrawer />
        <EnquiryDialog
          open={enquiryOpen}
          onClose={() => setEnquiryOpen(false)}
          watch={enquiryWatch}
          initialType={enquiryType}
        />
        <Toasts />
      </div>
    </ShellContext.Provider>
  );
}
