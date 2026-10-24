import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings as SettingsIcon,
  Watch,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useSettings } from '../../lib/store';
import { api } from '../../lib/api';
import { cx } from '../../lib/format';
import { Button } from '../../components/ui';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/watches', label: 'Watches', icon: Watch },
  { to: '/admin/inquiries', label: 'Enquiries', icon: Inbox },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    api
      .stats()
      .then((r) => setNewCount(r.stats.inquiries.new))
      .catch(() => {});
  }, [location.pathname]);

  const title = location.pathname.includes('/watches/new')
    ? 'New watch'
    : /\/watches\/[^/]+$/.test(location.pathname)
      ? 'Edit watch'
      : location.pathname.includes('/watches')
        ? 'Watches'
        : location.pathname.includes('/inquiries')
          ? 'Enquiries'
          : location.pathname.includes('/settings')
            ? 'Settings'
            : 'Overview';

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 border-b border-ivory/8 px-5 py-5">
        <span className="grid size-9 place-items-center border border-gold/45">
          <span className="display text-[15px] text-gold-soft">{settings.brandMark || 'UT'}</span>
        </span>
        <span>
          <span className="block text-[11px] tracking-[0.24em] text-ivory uppercase">{settings.brandName}</span>
          <span className="mt-0.5 block text-[8px] tracking-[0.26em] text-ivory/30 uppercase">Curator</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cx(
                'group flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.14em] uppercase transition-colors',
                isActive
                  ? 'bg-gold/10 text-gold-soft'
                  : 'text-ivory/45 hover:bg-white/[0.03] hover:text-ivory',
              )
            }
          >
            <link.icon className="size-4" strokeWidth={1.6} />
            {link.label}
            {link.label === 'Enquiries' && newCount > 0 && (
              <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-ink">
                {newCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-ivory/8 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.14em] text-ivory/45 uppercase transition-colors hover:text-ivory"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} /> View catalogue
        </Link>
        <button
          onClick={() => {
            logout();
            navigate('/admin');
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.14em] text-ivory/45 uppercase transition-colors hover:text-rose-300"
        >
          <LogOut className="size-4" strokeWidth={1.6} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="grain min-h-screen bg-[#08080a]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-ivory/8 bg-[#0a0a0d] lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-ivory/10 bg-[#0a0a0d]">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 text-ivory/40"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-ivory/8 bg-[#08080a]/92 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setOpen(true)} className="text-ivory/60 lg:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </button>
            <h1 className="text-[12px] tracking-[0.22em] text-ivory uppercase">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/admin/watches/new">
                <Button size="sm" icon={<Plus className="size-3.5" />}>
                  Add watch
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
