import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Eye,
  Inbox,
  Plus,
  Sparkles,
  Star,
  Watch as WatchIcon,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { Watch, WatchStats } from '../../lib/types';
import { money, timeAgo } from '../../lib/format';
import { Skeleton } from '../../components/ui';

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof WatchIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border p-5 ${
        accent ? 'border-gold/30 bg-gold/[0.045]' : 'border-ivory/10 bg-white/[0.015]'
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[9px] tracking-[0.2em] text-ivory/35 uppercase">{label}</p>
        <Icon className={`size-3.5 ${accent ? 'text-gold' : 'text-ivory/25'}`} />
      </div>
      <p className="display mt-4 text-4xl text-ivory">{value}</p>
      {hint && <p className="mt-1.5 text-[10px] text-ivory/30">{hint}</p>}
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<WatchStats | null>(null);
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    api.stats().then((r) => setStats(r.stats)).catch(() => {});
    api
      .watches({ includeUnpublished: true, sort: 'popular', limit: 5 })
      .then((r) => setWatches(r.items))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="display text-3xl text-ivory">Good to see you.</h2>
          <p className="mt-1 text-[11px] text-ivory/35">
            {stats.published} published · {stats.total - stats.published} drafts · {stats.inquiries.new} new
            enquiries
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/watches/new"
            className="inline-flex h-9 items-center gap-2 bg-gold px-4 text-[10px] font-medium tracking-[0.16em] text-ink uppercase transition-colors hover:bg-gold-soft"
          >
            <Plus className="size-3.5" /> Add a watch
          </Link>
          <Link
            to="/admin/inquiries"
            className="inline-flex h-9 items-center gap-2 border border-ivory/15 px-4 text-[10px] tracking-[0.16em] text-ivory/70 uppercase hover:border-ivory/30 hover:text-ivory"
          >
            <Inbox className="size-3.5" /> Inbox
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="In the catalogue"
          value={stats.total}
          hint={`${stats.published} live · ${stats.total - stats.published} draft`}
          icon={WatchIcon}
          accent
        />
        <StatCard label="On the floor" value={stats.inShowroom} hint="Marked in showroom" icon={Star} />
        <StatCard
          label="Catalogue views"
          value={stats.totalViews.toLocaleString('en-IN')}
          hint={`${stats.featured} featured pieces`}
          icon={Eye}
        />
        <StatCard
          label="Enquiries"
          value={stats.inquiries.total}
          hint={`${stats.inquiries.new} awaiting reply`}
          icon={Inbox}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="border border-ivory/10 bg-white/[0.015] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] tracking-[0.2em] text-ivory/45 uppercase">Catalogue by character</h3>
            <span className="text-[10px] text-ivory/25">{stats.brands} brands</span>
          </div>
          <div className="mt-5 space-y-3.5">
            {stats.byCategory.map((category) => (
              <div key={category.name}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[11px] text-ivory/70">{category.name}</span>
                  <span className="text-[10px] tabular-nums text-ivory/30">{category.count}</span>
                </div>
                <div className="h-[3px] w-full bg-ivory/8">
                  <div
                    className="h-full bg-gradient-to-r from-gold-deep to-gold-soft transition-all duration-700"
                    style={{ width: `${(category.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-ivory/8 pt-4">
            {stats.byBrand.map((brand) => (
              <span key={brand.name} className="border border-ivory/10 px-2 py-1 text-[9px] tracking-[0.14em] text-ivory/40 uppercase">
                {brand.name} · {brand.count}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-ivory/10 bg-white/[0.015] p-5">
          <h3 className="text-[10px] tracking-[0.2em] text-ivory/45 uppercase">Most viewed</h3>
          <ul className="mt-4 divide-y divide-ivory/8">
            {watches.map((watch) => (
              <li key={watch.id} className="flex items-center gap-3 py-2.5">
                <img src={watch.images[0]} alt="" className="size-9 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/admin/watches/${watch.id}`}
                    className="block truncate text-[12px] text-ivory/85 hover:text-gold"
                  >
                    {watch.brand} {watch.name}
                  </Link>
                  <p className="text-[10px] text-ivory/30">{money(watch.price, watch.currency)}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-ivory/35">
                  <Eye className="size-3" /> {watch.views}
                </span>
              </li>
            ))}
            {!watches.length && <li className="py-4 text-[11px] text-ivory/30">No watches yet.</li>}
          </ul>

          <div className="mt-4 border-t border-ivory/8 pt-4">
            <h4 className="text-[9px] tracking-[0.2em] text-ivory/30 uppercase">Recently added</h4>
            <ul className="mt-2 space-y-2">
              {stats.recentlyAdded.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-[11px]">
                  <Link to={`/admin/watches/${item.id}`} className="truncate text-ivory/60 hover:text-gold">
                    {item.name}
                  </Link>
                  <span className="shrink-0 pl-3 text-[10px] text-ivory/25">{timeAgo(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Add a piece',
            text: 'Photograph a new arrival and publish it in minutes.',
            to: '/admin/watches/new',
            icon: Plus,
          },
          {
            title: 'New arrivals page',
            text: 'Check how the catalogue looks to clients.',
            to: '/collection?sort=newest',
            icon: Sparkles,
          },
          {
            title: 'Brand & contact',
            text: 'Update the hero, address and social links.',
            to: '/admin/settings',
            icon: ArrowUpRight,
          },
        ].map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="group border border-ivory/10 bg-white/[0.015] p-5 transition-colors hover:border-gold/30 hover:bg-gold/[0.03]"
          >
            <action.icon className="size-4 text-gold/60" />
            <p className="mt-4 text-[12px] text-ivory/85 group-hover:text-gold-soft">{action.title}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-ivory/30">{action.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
