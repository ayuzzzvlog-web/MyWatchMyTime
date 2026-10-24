import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import type { Facets, Watch } from '../lib/types';
import { cx, money } from '../lib/format';
import { Button, CheckRow, Drawer, Select, Skeleton } from '../components/ui';
import { WatchCard } from '../components/WatchCard';
import { QuickView } from '../components/QuickView';
import { Reveal } from '../components/ui';

const SORTS = [
  { value: 'curated', label: 'Curated order' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'name', label: 'Name A–Z' },
];

const MULTI_KEYS = ['brand', 'category', 'gender', 'movement', 'availability'] as const;
type MultiKey = (typeof MULTI_KEYS)[number];

export default function Collection() {
  const [params, setParams] = useSearchParams();
  const [watches, setWatches] = useState<Watch[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quick, setQuick] = useState<Watch | null>(null);
  const [search, setSearch] = useState(params.get('q') || '');

  const view = (params.get('view') as 'grid' | 'list') || 'grid';
  const sort = params.get('sort') || 'curated';
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  const selections = useMemo(() => {
    const result = {} as Record<MultiKey, string[]>;
    MULTI_KEYS.forEach((key) => {
      result[key] = (params.get(key) || '').split(',').filter(Boolean);
    });
    return result;
  }, [params]);

  const activeCount =
    MULTI_KEYS.reduce((sum, key) => sum + selections[key].length, 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (params.get('q') ? 1 : 0);

  const update = useCallback(
    (mutator: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params);
      mutator(next);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const toggleFilter = (key: MultiKey, value: string) => {
    update((next) => {
      const current = (next.get(key) || '').split(',').filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (updated.length) next.set(key, updated.join(','));
      else next.delete(key);
    });
  };

  const clearAll = () => {
    setSearch('');
    setParams(new URLSearchParams(), { replace: true });
  };

  useEffect(() => {
    setSearch(params.get('q') || '');
  }, [params]);

  // Debounced search → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = params.get('q') || '';
      if (current === search) return;
      update((next) => {
        if (search.trim()) next.set('q', search.trim());
        else next.delete('q');
      });
    }, 320);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    api.facets().then(setFacets).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = {
      q: params.get('q') || undefined,
      brand: selections.brand,
      category: selections.category,
      gender: selections.gender,
      movement: selections.movement,
      availability: selections.availability,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      sort,
      limit: 120,
    };
    api
      .watches(query)
      .then((res) => setWatches(res.items))
      .catch(() => setWatches([]))
      .finally(() => setLoading(false));
  }, [params, selections, sort, minPrice, maxPrice]);

  const priceMin = facets?.price.min ?? 0;
  const priceMax = facets?.price.max ?? 100000;
  const rangeValue = Number(maxPrice || priceMax);

  const FilterPanel = (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] tracking-[0.22em] text-gold/80 uppercase">Search</h3>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ivory/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, brand, reference…"
            className="w-full border border-ivory/12 bg-white/[0.02] py-2.5 pr-3 pl-9 text-xs text-ivory placeholder:text-ivory/25 focus:border-gold/60 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-ivory/30 hover:text-ivory"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {facets && (
        <>
          <FilterGroup title="Brand">
            {facets.brands.map((item) => (
              <CheckRow
                key={item.name}
                label={item.name}
                count={item.count}
                checked={selections.brand.includes(item.name)}
                onChange={() => toggleFilter('brand', item.name)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Category">
            {facets.categories.map((item) => (
              <CheckRow
                key={item.name}
                label={item.name}
                count={item.count}
                checked={selections.category.includes(item.name)}
                onChange={() => toggleFilter('category', item.name)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Movement">
            {facets.movements.map((item) => (
              <CheckRow
                key={item.name}
                label={item.name}
                count={item.count}
                checked={selections.movement.includes(item.name)}
                onChange={() => toggleFilter('movement', item.name)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Worn by">
            {facets.genders.map((item) => (
              <CheckRow
                key={item.name}
                label={item.name}
                count={item.count}
                checked={selections.gender.includes(item.name)}
                onChange={() => toggleFilter('gender', item.name)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Availability">
            {facets.availabilities.map((item) => (
              <CheckRow
                key={item.name}
                label={item.name}
                count={item.count}
                checked={selections.availability.includes(item.name)}
                onChange={() => toggleFilter('availability', item.name)}
              />
            ))}
          </FilterGroup>
        </>
      )}

      <div>
        <h3 className="mb-3 text-[10px] tracking-[0.22em] text-gold/80 uppercase">Budget</h3>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={Math.max(1, Math.round((priceMax - priceMin) / 60))}
          value={rangeValue}
          onChange={(e) =>
            update((next) => {
              const val = Number(e.target.value);
              if (val >= priceMax) next.delete('maxPrice');
              else next.set('maxPrice', String(val));
            })
          }
        />
        <div className="mt-2 flex items-center justify-between text-[10px] text-ivory/35">
          <span>{money(priceMin)}</span>
          <span className="text-gold-soft">up to {money(rangeValue)}</span>
        </div>
      </div>

      <button
        onClick={clearAll}
        className="flex w-full items-center justify-center gap-2 border border-ivory/12 py-2.5 text-[10px] tracking-[0.18em] text-ivory/45 uppercase transition-colors hover:border-ivory/25 hover:text-ivory"
      >
        <RotateCcw className="size-3" /> Reset filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8">
      {/* header band */}
      <div className="border-b border-ivory/8 py-14 sm:py-20">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="label text-gold/85">The Collection</span>
          </div>
          <h1 className="display mt-5 text-[clamp(2.6rem,6vw,4.8rem)] text-ivory">
            Every piece, <em className="text-gold-soft not-italic">in stock</em>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/45">
            {facets ? `${facets.total} references currently catalogued` : 'Loading the cabinet'} — filter by
            character, movement or budget. Prices are indicative; ask us about the best possible number.
          </p>
        </Reveal>
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 no-scrollbar">{FilterPanel}</div>
        </aside>

        <div>
          <div className="sticky top-[72px] z-30 -mx-5 mb-6 flex flex-wrap items-center gap-3 border-b border-ivory/8 bg-[#08080a]/92 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 border border-ivory/12 px-3 py-2 text-[10px] tracking-[0.18em] text-ivory/70 uppercase lg:hidden"
            >
              <SlidersHorizontal className="size-3.5" />
              Filters {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
            </button>

            <p className="hidden text-[10px] tracking-[0.16em] text-ivory/30 uppercase sm:block">
              {loading ? 'Filtering…' : `${watches.length} piece${watches.length === 1 ? '' : 's'}`}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <div className="w-40 sm:w-48">
                <Select
                  value={sort}
                  onChange={(e) => update((next) => next.set('sort', e.target.value))}
                  className="h-9 pr-8 text-[11px]"
                  aria-label="Sort"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="hidden items-center border border-ivory/12 sm:flex">
                {[
                  { value: 'grid', icon: LayoutGrid },
                  { value: 'list', icon: List },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => update((next) => next.set('view', option.value))}
                    aria-label={`${option.value} view`}
                    className={cx(
                      'grid size-9 place-items-center transition-colors',
                      view === option.value ? 'bg-gold/12 text-gold' : 'text-ivory/35 hover:text-ivory',
                    )}
                  >
                    <option.icon className="size-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {MULTI_KEYS.flatMap((key) =>
                selections[key].map((value) => (
                  <button
                    key={`${key}-${value}`}
                    onClick={() => toggleFilter(key, value)}
                    className="group flex items-center gap-1.5 border border-gold/35 bg-gold/8 px-2.5 py-1 text-[10px] tracking-[0.12em] text-gold-soft uppercase"
                  >
                    {value}
                    <X className="size-2.5 opacity-60 group-hover:opacity-100" />
                  </button>
                )),
              )}
              {params.get('maxPrice') && (
                <button
                  onClick={() => update((next) => next.delete('maxPrice'))}
                  className="group flex items-center gap-1.5 border border-gold/35 bg-gold/8 px-2.5 py-1 text-[10px] tracking-[0.12em] text-gold-soft uppercase"
                >
                  Under {money(Number(params.get('maxPrice')))}
                  <X className="size-2.5 opacity-60 group-hover:opacity-100" />
                </button>
              )}
              <button
                onClick={clearAll}
                className="ml-1 text-[10px] tracking-[0.14em] text-ivory/30 uppercase hover:text-ivory"
              >
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className={cx('grid gap-x-4 gap-y-10 sm:gap-x-6', view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className={cx('w-full', view === 'grid' ? 'aspect-[4/5]' : 'aspect-square')} />
                  <Skeleton className="mt-4 h-3 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : watches.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-ivory/12 py-24 text-center">
              <Search className="size-7 text-ivory/20" />
              <h3 className="display mt-5 text-3xl text-ivory">Nothing matches — yet.</h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory/40">
                We source to order. Tell us the reference you are after and we will look for it on your
                behalf.
              </p>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cx(
                view === 'grid'
                  ? 'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3'
                  : 'flex flex-col divide-y divide-ivory/8',
              )}
            >
              {watches.map((watch, index) => (
                <WatchCard
                  key={watch.id}
                  watch={watch}
                  index={index}
                  layout={view}
                  onQuickView={view === 'grid' ? setQuick : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Refine"
        subtitle={facets ? `${facets.total} references` : undefined}
        side="left"
        footer={
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Show {watches.length} result{watches.length === 1 ? '' : 's'}
          </Button>
        }
      >
        {FilterPanel}
      </Drawer>

      <QuickView watch={quick} onClose={() => setQuick(null)} />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-ivory/8 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between text-[10px] tracking-[0.22em] text-gold/80 uppercase"
      >
        {title}
        <span className="text-ivory/25">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}
