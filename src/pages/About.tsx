import { Link } from 'react-router-dom';
import { ArrowRight, Gem, Handshake, Microscope, PackageCheck, Quote } from 'lucide-react';
import { useSettings } from '../lib/store';
import { Button, Counter, Reveal, SectionHeading } from '../components/ui';
import { useShell } from '../components/AppShell';

const TIMELINE = [
  {
    year: '2017',
    title: 'One cabinet',
    text: 'A single glass case on Boring Road, four watches, and a notebook of names. The first piece sold in three days.',
  },
  {
    year: '2019',
    title: 'The workshop',
    text: 'We hired our first watchmaker and stopped outsourcing servicing. Every watch now leaves with a signed inspection card.',
  },
  {
    year: '2022',
    title: 'The studio',
    text: 'In-house photography replaced borrowed images. Clients started telling us the catalogue felt like a magazine.',
  },
  {
    year: '2026',
    title: 'The catalogue',
    text: 'A living, always-current record of the cabinet — searchable, comparable, and honest about availability.',
  },
];

const VALUES = [
  {
    icon: Microscope,
    title: 'Inspection first',
    text: 'Movement, case, crystal, bracelet — checked against the reference before anything is listed. Anything doubtful never reaches the catalogue.',
  },
  {
    icon: Gem,
    title: 'Photographed honestly',
    text: 'No filters that hide scratches, no borrowed stock imagery. What you see is the exact piece that will arrive.',
  },
  {
    icon: Handshake,
    title: 'Advised, not sold',
    text: 'We will happily tell you when a watch is wrong for your wrist. A shortlist of three that fit beats a page of twenty.',
  },
  {
    icon: PackageCheck,
    title: 'Delivered properly',
    text: 'Insured, tracked and packed in a hard case. Every shipment is accompanied by documentation and a direct line to us.',
  },
];

export default function About() {
  const { settings } = useSettings();
  const { openEnquiry } = useShell();

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-ivory/8">
        <img
          src="/images/w7.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/85 to-[#08080a]/30" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-28 sm:px-8 sm:py-36">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold/60" />
              <span className="label text-gold/85">The House</span>
            </div>
            <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.8rem,7vw,5.6rem)] text-ivory">
              We sell fewer watches, <em className="text-gold-soft not-italic">on purpose.</em>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-[1.9] text-ivory/50">{settings.aboutText}</p>
          </Reveal>
        </div>
      </section>

      {/* numbers */}
      <section className="border-b border-ivory/8 bg-[#070709]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-ivory/8 px-5 sm:px-8 lg:grid-cols-4">
          {[
            { value: 9, suffix: '+', label: 'Years curating' },
            { value: 400, suffix: '+', label: 'Pieces placed' },
            { value: 14, suffix: '', label: 'Brands carried' },
            { value: 100, suffix: '%', label: 'Authenticated' },
          ].map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.05}>
              <div className="px-2 py-10 sm:px-8 sm:py-14">
                <p className="display text-4xl text-gold-soft sm:text-5xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-[9px] tracking-[0.2em] text-ivory/35 uppercase">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* values */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="What we hold to"
            title={
              <>
                Four rules we <em className="text-gold-soft not-italic">don't</em> bend
              </>
            }
          />
        </Reveal>
        <div className="mt-12 grid gap-px bg-ivory/8 sm:grid-cols-2">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.06}>
              <div className="group h-full bg-[#08080a] p-8 transition-colors duration-500 hover:bg-[#0c0c10] sm:p-10">
                <value.icon className="size-6 text-gold/70" strokeWidth={1.2} />
                <h3 className="mt-6 text-sm tracking-[0.1em] text-ivory uppercase">{value.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-ivory/40">{value.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* timeline */}
      <section className="border-y border-ivory/8 bg-[#070709]">
        <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
          <Reveal>
            <SectionHeading eyebrow="Timeline" title="How we got here" />
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {TIMELINE.map((item, index) => (
              <Reveal key={item.year} delay={index * 0.07}>
                <div className="relative border-t border-ivory/15 pt-6">
                  <span className="absolute -top-[3px] left-0 size-1.5 rotate-45 bg-gold" />
                  <p className="display text-3xl text-gold-soft">{item.year}</p>
                  <h3 className="mt-3 text-[11px] tracking-[0.18em] text-ivory/80 uppercase">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ivory/35">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* pull quote */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <Quote className="mx-auto size-7 text-gold/35" strokeWidth={1.2} />
        <blockquote className="display mt-8 text-[clamp(1.6rem,3.6vw,2.8rem)] leading-tight text-ivory/90">
          “A watch is the only object most people will look at a hundred times a day for thirty years.
          It deserves to be chosen properly.”
        </blockquote>
        <p className="mt-6 text-[10px] tracking-[0.24em] text-gold-soft/80 uppercase">The founder</p>
      </section>

      {/* cta */}
      <section className="border-t border-ivory/8 bg-[#070709]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="display text-3xl text-ivory sm:text-4xl">Come and see them in person.</h2>
            <p className="mt-2 text-xs text-ivory/40">{settings.viewingNote}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => openEnquiry(null, 'viewing')}>Book a viewing</Button>
            <Link to="/collection">
              <Button variant="outline" iconRight={<ArrowRight className="size-3.5" />}>
                The collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
