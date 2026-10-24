import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Compass,
  Gem,
  MoveRight,
  Quote,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Facets, Watch } from '../lib/types';
import { useSettings } from '../lib/store';
import { Button, Counter, Reveal, SectionHeading, Skeleton } from '../components/ui';
import { WatchCard } from '../components/WatchCard';
import { LiveDial } from '../components/LiveDial';
import { QuickView } from '../components/QuickView';
import { useShell } from '../components/AppShell';
import { cx, money } from '../lib/format';

/* -------------------------------- Hero ------------------------------ */
function Hero() {
  const { settings } = useSettings();
  const { openEnquiry } = useShell();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const words = settings.heroTitle.split(' ');

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden bg-black">
      <motion.div style={{ y: imageY }} className="absolute inset-0 scale-110">
        <img
          src={settings.heroImage}
          alt=""
          className="size-full object-cover object-[68%_center] opacity-80"
          fetchPriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-[#08080a]/70" />

      <motion.div
        style={{ y: contentY, opacity }}
        className="relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col justify-center px-5 pt-16 pb-24 sm:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-10 bg-gold/60" />
          <span className="text-[10px] font-medium tracking-[0.3em] text-gold-soft/90 uppercase">
            {settings.heroEyebrow}
          </span>
        </motion.div>

        <h1 className="display mt-7 max-w-[13ch] text-[clamp(3.2rem,9vw,7.5rem)] text-ivory">
          {words.map((word, i) => (
            <span key={`${word}-${i}`} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
              <motion.span
                initial={{ y: '108%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, delay: 0.2 + i * 0.11, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {word === 'still.' ? <em className="text-gold-soft not-italic">{word}</em> : word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-7 max-w-md text-[13px] leading-relaxed text-ivory/55 sm:text-sm"
        >
          {settings.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link to="/collection">
            <Button size="lg" iconRight={<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />}>
              {settings.heroPrimaryCta}
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => openEnquiry(null, 'viewing')}>
            {settings.heroSecondaryCta}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ivory/10 pt-6 sm:gap-x-12"
        >
          {[
            { icon: ShieldCheck, label: 'Authenticity guaranteed' },
            { icon: Truck, label: 'Insured nationwide delivery' },
            { icon: CalendarClock, label: 'Private appointments' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="size-3.5 shrink-0 text-gold/60" />
              <span className="text-[9px] leading-tight tracking-[0.14em] text-ivory/35 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 1 }}
        className="absolute right-8 bottom-10 hidden items-end gap-4 lg:flex"
      >
        <div className="text-right">
          <p className="text-[9px] tracking-[0.24em] text-ivory/30 uppercase">Local time</p>
          <p className="mt-1 text-[10px] tracking-[0.18em] text-gold-soft/80 uppercase">Patna · IST</p>
        </div>
        <LiveDial className="w-24 drop-shadow-[0_18px_40px_rgba(0,0,0,0.7)]" />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08080a] to-transparent" />
    </section>
  );
}

/* ------------------------------ Brand bar --------------------------- */
function BrandBar({ brands }: { brands: Facets['brands'] }) {
  if (!brands.length) return null;
  const list = [...brands, ...brands];
  return (
    <section className="relative border-y border-ivory/8 bg-[#070709] py-5">
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee items-center whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {list.map((brand, i) => (
                <span key={`${dup}-${brand.name}-${i}`} className="flex items-center">
                  <Link
                    to={`/collection?brand=${encodeURIComponent(brand.name)}`}
                    className="px-8 text-[11px] font-medium tracking-[0.32em] text-ivory/30 uppercase transition-colors hover:text-gold"
                  >
                    {brand.name}
                  </Link>
                  <span className="size-1 rotate-45 bg-gold/30" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- The edit --------------------------- */
function TheEdit({ watches, loading }: { watches: Watch[]; loading: boolean }) {
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(watches.map((w) => w.category)))],
    [watches],
  );
  const [active, setActive] = useState('All');
  const [quick, setQuick] = useState<Watch | null>(null);
  const filtered = active === 'All' ? watches : watches.filter((w) => w.category === active);

  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The Edit"
          title={
            <>
              Pieces we would <em className="text-gold-soft not-italic">keep</em> for ourselves
            </>
          }
          description="A rotating selection from the cabinet — chosen for proportion, movement and the way they wear after a year."
          action={
            <Link to="/collection" className="group hidden items-center gap-2 text-[10px] tracking-[0.22em] text-ivory/50 uppercase transition-colors hover:text-gold md:flex">
              View all pieces
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={cx(
                'shrink-0 border px-3.5 py-2 text-[10px] font-medium tracking-[0.18em] uppercase transition-all duration-300',
                active === category
                  ? 'border-gold/70 bg-gold/10 text-gold-soft'
                  : 'border-ivory/10 text-ivory/35 hover:border-ivory/25 hover:text-ivory/70',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="mt-4 h-3 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            ))
          : filtered.slice(0, 8).map((watch, index) => (
              <WatchCard key={watch.id} watch={watch} index={index} onQuickView={setQuick} />
            ))}
      </div>

      <div className="mt-12 flex justify-center md:hidden">
        <Link to="/collection">
          <Button variant="outline">View all pieces</Button>
        </Link>
      </div>

      <QuickView watch={quick} onClose={() => setQuick(null)} />
    </section>
  );
}

/* -------------------------------- Story ----------------------------- */
function Story({ watches }: { watches: Watch[] }) {
  const { settings } = useSettings();
  return (
    <section className="relative overflow-hidden border-y border-ivory/8 bg-[#070709]">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden">
              <img
                src={watches[3]?.images[0] || settings.heroImage}
                alt="Inside the atelier"
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -right-4 -bottom-8 w-40 overflow-hidden border-4 border-[#070709] sm:-right-8 sm:w-56">
              <img
                src={watches[5]?.images[0] || settings.heroImage}
                alt="Detail"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="absolute top-6 -left-4 hidden border border-gold/30 bg-[#0a0a0d]/90 px-5 py-4 backdrop-blur sm:-left-8 sm:block">
              <p className="display text-3xl text-gold-soft">
                <Counter to={9} suffix="" />+
              </p>
              <p className="mt-1 text-[9px] tracking-[0.2em] text-ivory/40 uppercase">Years curating</p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gold/60" />
              <span className="label text-gold/85">The House</span>
            </div>
            <h2 className="display text-[clamp(2.2rem,4.6vw,3.8rem)] text-ivory">{settings.aboutHeading}</h2>
            <p className="mt-6 max-w-lg text-sm leading-[1.9] text-ivory/50">{settings.aboutText}</p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ivory/10 pt-8">
              {[
                { value: 9, suffix: '+', label: 'Years curating' },
                { value: 400, suffix: '+', label: 'Pieces placed' },
                { value: 100, suffix: '%', label: 'Authenticated' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="display text-4xl text-gold-soft sm:text-5xl">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1.5 text-[9px] tracking-[0.18em] text-ivory/35 uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <Link to="/about" className="group mt-10 inline-flex items-center gap-3">
              <span className="text-[10px] tracking-[0.24em] text-ivory/60 uppercase transition-colors group-hover:text-gold">
                Read our story
              </span>
              <span className="grid size-9 place-items-center border border-ivory/15 transition-colors group-hover:border-gold/60">
                <MoveRight className="size-3.5 text-gold transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Categories -------------------------- */
function Categories({ watches }: { watches: Watch[] }) {
  const featured = ['Dive', 'Dress', 'Chronograph', 'GMT'];
  const cards = featured
    .map((category) => {
      const watch = watches.find((w) => w.category === category);
      return watch ? { category, watch } : null;
    })
    .filter((c): c is { category: string; watch: Watch } => Boolean(c));

  if (!cards.length) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="By character"
          title={
            <>
              Find the one that <em className="text-gold-soft not-italic">fits</em>
            </>
          }
          description="Start with how you live, not what is trending. Each family has its own logic — we can walk you through all of them."
        />
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Reveal key={card.category} delay={index * 0.06}>
            <Link
              to={`/collection?category=${encodeURIComponent(card.category)}`}
              className="group relative block aspect-[3/4] overflow-hidden bg-surface"
            >
              <img
                src={card.watch.images[0]}
                alt={card.category}
                loading="lazy"
                className="size-full object-cover opacity-70 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] tracking-[0.22em] text-gold/70 uppercase">Collection</p>
                    <h3 className="display mt-1 text-2xl text-ivory">{card.category}</h3>
                  </div>
                  <span className="grid size-8 place-items-center border border-ivory/25 text-ivory/70 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-ivory/35">
                  From {money(card.watch.price, card.watch.currency)}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Process ---------------------------- */
function Process() {
  const steps = [
    {
      icon: Compass,
      title: 'Browse the catalogue',
      text: 'Every piece is photographed in our studio and documented with real specifications — no stock imagery, no guesswork.',
    },
    {
      icon: Gem,
      title: 'Enquire or shortlist',
      text: 'Save pieces, compare them side by side, then send a single enquiry. We answer personally, usually the same day.',
    },
    {
      icon: BadgeCheck,
      title: 'View, verify, wear',
      text: 'Book a private appointment or an insured delivery. Inspect the watch, verify the papers, and take your time.',
    },
  ];
  return (
    <section className="border-y border-ivory/8 bg-[#070709]">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            align="center"
            title={
              <>
                Three steps, <em className="text-gold-soft not-italic">no pressure</em>
              </>
            }
          />
        </Reveal>
        <div className="mt-14 grid gap-px bg-ivory/8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="group relative h-full bg-[#070709] p-8 transition-colors duration-500 hover:bg-[#0b0b0e] sm:p-10">
                <span className="display absolute top-6 right-7 text-5xl text-ivory/[0.05]">
                  0{index + 1}
                </span>
                <step.icon className="size-6 text-gold/70" strokeWidth={1.2} />
                <h3 className="mt-6 text-sm font-medium tracking-[0.1em] text-ivory uppercase">{step.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-ivory/40">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Testimonials -------------------------- */
const QUOTES = [
  {
    quote:
      'I have bought three watches here and never once felt sold to. They talked me out of my first choice — and they were right.',
    name: 'Rohan M.',
    detail: 'Collector · Patna',
  },
  {
    quote:
      'The photographs were exactly the watch that arrived. In this market, that alone is worth the premium.',
    name: 'Ananya S.',
    detail: 'First purchase · Bengaluru',
  },
  {
    quote:
      'They sourced a reference I had been chasing for two years, then serviced it before handover without being asked.',
    name: 'Vikram T.',
    detail: 'Repeat client · Mumbai',
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);
  const active = QUOTES[index];
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Quote className="mx-auto size-7 text-gold/35" strokeWidth={1.2} />
        <div className="relative mt-8 min-h-[190px] sm:min-h-[170px]">
          {QUOTES.map((q, i) => (
            <motion.blockquote
              key={q.name}
              animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : 12 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={cx('absolute inset-0', i === index ? '' : 'pointer-events-none')}
            >
              <p className="display text-[clamp(1.4rem,3.2vw,2.3rem)] leading-tight text-ivory/90">
                “{active.quote}”
              </p>
              <footer className="mt-6">
                <p className="text-[11px] tracking-[0.2em] text-gold-soft/90 uppercase">{active.name}</p>
                <p className="mt-1 text-[10px] tracking-[0.14em] text-ivory/30 uppercase">{active.detail}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          {QUOTES.map((q, i) => (
            <button
              key={q.name}
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={cx(
                'h-px transition-all duration-500',
                i === index ? 'w-10 bg-gold' : 'w-5 bg-ivory/20 hover:bg-ivory/40',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA ------------------------------- */
function CtaBand() {
  const { settings } = useSettings();
  const { openEnquiry } = useShell();
  return (
    <section className="relative overflow-hidden">
      <img
        src={settings.heroImage}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover object-center opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/85 to-[#08080a]/40" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
        <Reveal>
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="size-3.5 text-gold" />
              <span className="label text-gold/85">By appointment</span>
            </div>
            <h2 className="display text-[clamp(2.2rem,5vw,4rem)] text-ivory">
              See it on your wrist <em className="text-gold-soft not-italic">before</em> you decide.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/50">
              Book a private half-hour at the showroom, or ask us to bring a shortlist to you. Coffee,
              loupe and no obligation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => openEnquiry(null, 'viewing')}>
                Book a private viewing
              </Button>
              <Link to="/collection">
                <Button size="lg" variant="outline">
                  Browse the catalogue
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- Page ------------------------------ */
export default function Home() {
  const [featured, setFeatured] = useState<Watch[]>([]);
  const [all, setAll] = useState<Watch[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.watches({ featured: true, limit: 8 }), api.watches({ limit: 24 }), api.facets()])
      .then(([feat, everything, f]) => {
        setAll(everything.items);
        setFeatured(feat.items.length >= 4 ? feat.items : everything.items.slice(0, 8));
        setFacets(f);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <BrandBar brands={facets?.brands ?? []} />
      <TheEdit watches={featured} loading={loading} />
      <Story watches={all.length ? all : featured} />
      <Categories watches={all} />
      <Process />
      <Testimonials />
      <CtaBand />
    </>
  );
}
