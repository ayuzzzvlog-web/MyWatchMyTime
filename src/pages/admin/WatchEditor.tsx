import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Save, Sparkles, Trash2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Watch } from '../../lib/types';
import { AVAILABILITY_OPTIONS, CATEGORY_OPTIONS, GENDER_OPTIONS, MOVEMENT_OPTIONS } from '../../lib/types';
import { cx, money } from '../../lib/format';
import { useSettings, useToast } from '../../lib/store';
import { Button, Field, Input, Modal, Select, Textarea, Toggle } from '../../components/ui';
import { ImageUploader } from '../../components/admin/ImageUploader';

type Draft = Omit<Watch, 'id' | 'views' | 'createdAt' | 'updatedAt'>;

const emptyDraft: Draft = {
  name: '',
  brand: '',
  reference: '',
  collection: '',
  category: 'Dive',
  gender: 'Men',
  movement: 'Automatic',
  caseMaterial: '',
  caseSize: null,
  caseThickness: null,
  dialColor: '',
  strap: '',
  crystal: 'Sapphire',
  waterResistance: '',
  condition: 'Unworn',
  availability: 'In Showroom',
  price: 0,
  compareAtPrice: null,
  currency: 'INR',
  slug: '',
  sortOrder: 0,
  images: [],
  shortDescription: '',
  description: '',
  story: '',
  highlights: [],
  tags: [],
  badge: '',
  featured: false,
  published: true,
};

const SECTIONS = [
  { id: 'basics', label: 'Basics' },
  { id: 'specs', label: 'Specifications' },
  { id: 'pricing', label: 'Price & status' },
  { id: 'copy', label: 'Description' },
  { id: 'media', label: 'Photographs' },
] as const;

export function WatchEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { push } = useToast();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [highlightInput, setHighlightInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('basics');

  useEffect(() => {
    if (isNew) {
      setDraft({ ...emptyDraft, currency: settings.currency });
      return;
    }
    api
      .watches({ includeUnpublished: true, limit: 120 })
      .then(async (list) => {
        const found = list.items.find((w) => w.id === id);
        if (found) {
          setDraft(found);
        } else {
          const { watch } = await api.watch(id!);
          setDraft(watch);
        }
      })
      .catch(() => push({ title: 'Could not load that watch', tone: 'error' }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const preview = useMemo(
    () => ({ ...draft, images: draft.images.length ? draft.images : ['/images/w1.jpg'] }),
    [draft],
  );

  const save = async () => {
    setErrors({});
    if (!draft.name.trim() || draft.name.trim().length < 2) {
      setErrors({ name: 'Give the piece a name' });
      setActiveSection('basics');
      push({ title: 'A name is required', tone: 'error' });
      return;
    }
    if (!draft.brand.trim()) {
      setErrors({ brand: 'Brand is required' });
      setActiveSection('basics');
      push({ title: 'A brand is required', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        caseSize: draft.caseSize === null || Number.isNaN(draft.caseSize) ? null : Number(draft.caseSize),
        caseThickness:
          draft.caseThickness === null || Number.isNaN(draft.caseThickness) ? null : Number(draft.caseThickness),
        compareAtPrice:
          draft.compareAtPrice === null || Number.isNaN(draft.compareAtPrice)
            ? null
            : Number(draft.compareAtPrice),
        price: Number(draft.price) || 0,
      };
      if (isNew) {
        const { watch } = await api.createWatch(payload);
        push({ title: 'Watch added to the catalogue', tone: 'success' });
        navigate(`/admin/watches/${watch.id}`, { replace: true });
      } else {
        const { watch } = await api.updateWatch(id!, payload);
        setDraft(watch);
        push({ title: 'Changes saved', tone: 'success' });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const issues = error.issues as { fieldErrors?: Record<string, string[]> } | undefined;
        if (issues?.fieldErrors) {
          const mapped: Record<string, string> = {};
          Object.entries(issues.fieldErrors).forEach(([key, value]) => {
            if (value?.length) mapped[key] = value[0];
          });
          setErrors(mapped);
        }
        push({ title: error.message, tone: 'error' });
      } else {
        push({ title: 'Could not save', tone: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (isNew) return;
    try {
      await api.deleteWatch(id!);
      push({ title: 'Watch deleted', tone: 'success' });
      navigate('/admin/watches');
    } catch {
      push({ title: 'Could not delete', tone: 'error' });
    }
  };

  const addHighlight = () => {
    const value = highlightInput.trim();
    if (!value || draft.highlights.includes(value)) return;
    set('highlights', [...draft.highlights, value].slice(0, 12));
    setHighlightInput('');
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || draft.tags.includes(value)) return;
    set('tags', [...draft.tags, value].slice(0, 16));
    setTagInput('');
  };

  if (loading) {
    return <p className="py-20 text-center text-[11px] text-ivory/30">Loading watch…</p>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/watches"
            className="flex items-center gap-2 text-[10px] tracking-[0.16em] text-ivory/40 uppercase hover:text-ivory"
          >
            <ArrowLeft className="size-3" /> All watches
          </Link>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Link to={`/watch/${draft.slug}`} target="_blank">
                <Button variant="ghost" size="sm" icon={<ExternalLink className="size-3" />}>
                  View live
                </Button>
              </Link>
            )}
            {!isNew && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                icon={<Trash2 className="size-3" />}
                className="text-rose-300/70 hover:text-rose-300"
              >
                Delete
              </Button>
            )}
            <Button size="sm" loading={saving} onClick={save} icon={<Save className="size-3" />}>
              {isNew ? 'Publish watch' : 'Save changes'}
            </Button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setActiveSection(section.id)}
              className={cx(
                'shrink-0 border px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors',
                activeSection === section.id
                  ? 'border-gold/50 bg-gold/10 text-gold-soft'
                  : 'border-ivory/10 text-ivory/35 hover:text-ivory/70',
              )}
            >
              {section.label}
            </a>
          ))}
        </div>

        {/* basics */}
        <Section id="basics" title="The basics" description="How this piece is identified across the catalogue.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name} className="sm:col-span-2">
              <Input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Regatta Diver"
              />
            </Field>
            <Field label="Brand" error={errors.brand}>
              <Input value={draft.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Aeterna" />
            </Field>
            <Field label="Reference" optional>
              <Input
                value={draft.reference}
                onChange={(e) => set('reference', e.target.value)}
                placeholder="AE-126610LN"
              />
            </Field>
            <Field label="Collection" optional>
              <Input
                value={draft.collection}
                onChange={(e) => set('collection', e.target.value)}
                placeholder="Regatta"
              />
            </Field>
            <Field label="Category">
              <Select value={draft.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Worn by">
              <Select value={draft.gender} onChange={(e) => set('gender', e.target.value)}>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Badge" optional hint="Shown on the card">
              <Input
                value={draft.badge}
                onChange={(e) => set('badge', e.target.value)}
                placeholder="New arrival"
                maxLength={40}
              />
            </Field>
          </div>
        </Section>

        {/* specs */}
        <Section id="specs" title="Specifications" description="Empty values are hidden on the product page.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Movement">
              <Select value={draft.movement} onChange={(e) => set('movement', e.target.value)}>
                {MOVEMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Case material">
              <Input
                value={draft.caseMaterial}
                onChange={(e) => set('caseMaterial', e.target.value)}
                placeholder="Gold & Steel"
              />
            </Field>
            <Field label="Case size (mm)" optional>
              <Input
                type="number"
                step="0.1"
                value={draft.caseSize ?? ''}
                onChange={(e) => set('caseSize', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="41"
              />
            </Field>
            <Field label="Thickness (mm)" optional>
              <Input
                type="number"
                step="0.1"
                value={draft.caseThickness ?? ''}
                onChange={(e) => set('caseThickness', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="12.5"
              />
            </Field>
            <Field label="Dial colour" optional>
              <Input value={draft.dialColor} onChange={(e) => set('dialColor', e.target.value)} placeholder="Black" />
            </Field>
            <Field label="Strap / bracelet" optional>
              <Input value={draft.strap} onChange={(e) => set('strap', e.target.value)} placeholder="Rubber" />
            </Field>
            <Field label="Crystal" optional>
              <Input value={draft.crystal} onChange={(e) => set('crystal', e.target.value)} />
            </Field>
            <Field label="Water resistance" optional>
              <Input
                value={draft.waterResistance}
                onChange={(e) => set('waterResistance', e.target.value)}
                placeholder="300 m"
              />
            </Field>
            <Field label="Condition">
              <Input
                value={draft.condition}
                onChange={(e) => set('condition', e.target.value)}
                placeholder="Unworn / Pre-owned · Excellent"
              />
            </Field>
            <Field label="Availability">
              <Select
                value={draft.availability}
                onChange={(e) => set('availability', e.target.value as Draft['availability'])}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Highlights" hint="Short bullet points" optional>
              <div className="flex gap-2">
                <Input
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHighlight();
                    }
                  }}
                  placeholder="Ceramic bezel — press enter"
                />
                <Button type="button" variant="dark" onClick={addHighlight}>
                  Add
                </Button>
              </div>
            </Field>
            {draft.highlights.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draft.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="flex items-center gap-1.5 border border-ivory/12 bg-white/[0.02] px-2 py-1 text-[10px] text-ivory/60"
                  >
                    {highlight}
                    <button
                      onClick={() => set('highlights', draft.highlights.filter((h) => h !== highlight))}
                      className="text-ivory/30 hover:text-rose-300"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5">
            <Field label="Tags" hint="Used for search" optional>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Diver — press enter"
                />
                <Button type="button" variant="dark" onClick={addTag}>
                  Add
                </Button>
              </div>
            </Field>
            {draft.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 border border-gold/25 bg-gold/8 px-2 py-1 text-[10px] text-gold-soft/80"
                  >
                    {tag}
                    <button
                      onClick={() => set('tags', draft.tags.filter((t) => t !== tag))}
                      className="text-gold/50 hover:text-rose-300"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* pricing */}
        <Section id="pricing" title="Price & status" description="Prices are shown on cards only if enabled in settings.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price" error={errors.price}>
              <Input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => set('price', Number(e.target.value))}
                placeholder="1599"
              />
            </Field>
            <Field label="Compare at" optional hint="Struck-through">
              <Input
                type="number"
                min={0}
                value={draft.compareAtPrice ?? ''}
                onChange={(e) => set('compareAtPrice', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="1999"
              />
            </Field>
            <Field label="Currency">
              <Select value={draft.currency} onChange={(e) => set('currency', e.target.value)}>
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD'].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Curated position" hint="Lower shows first" optional>
              <Input
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Toggle
              checked={draft.published}
              onChange={(v) => set('published', v)}
              label="Published"
              description="Visible in the public catalogue"
            />
            <Toggle
              checked={draft.featured}
              onChange={(v) => set('featured', v)}
              label="Featured in the Edit"
              description="Shows on the homepage"
            />
          </div>
        </Section>

        {/* copy */}
        <Section id="copy" title="Description" description="Tell the story — the details clients ask about.">
          <div className="space-y-4">
            <Field label="Short description" hint={`${draft.shortDescription.length}/240`} optional>
              <Textarea
                rows={2}
                maxLength={240}
                value={draft.shortDescription}
                onChange={(e) => set('shortDescription', e.target.value)}
                placeholder="One line that captures the piece."
              />
            </Field>
            <Field label="Full description" optional>
              <Textarea
                rows={5}
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Condition, movement, what makes it interesting…"
              />
            </Field>
            <Field label="Provenance / story" optional>
              <Textarea
                rows={3}
                value={draft.story}
                onChange={(e) => set('story', e.target.value)}
                placeholder="Where it came from, why it matters."
              />
            </Field>
          </div>
        </Section>

        {/* media */}
        <Section id="media" title="Photographs" description="The first image is the cover. Drag files to upload.">
          <ImageUploader value={draft.images} onChange={(images) => set('images', images)} />
        </Section>

        <div className="flex items-center justify-end gap-2 border-t border-ivory/10 pt-5">
          <Link to="/admin/watches">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button loading={saving} onClick={save} icon={<Save className="size-3.5" />}>
            {isNew ? 'Publish watch' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* live preview */}
      <aside className="hidden xl:block">
        <div className="sticky top-24 space-y-3">
          <p className="text-[9px] tracking-[0.2em] text-ivory/30 uppercase">Card preview</p>
          <div className="group relative overflow-hidden border border-ivory/10 bg-[#0b0b0e]">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
              <img src={preview.images[0]} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                {draft.badge && (
                  <span className="bg-gold px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] text-ink uppercase">
                    {draft.badge}
                  </span>
                )}
                {!draft.published && (
                  <span className="bg-black/70 px-2 py-0.5 text-[8px] tracking-[0.14em] text-amber-200 uppercase">
                    Draft
                  </span>
                )}
              </div>
            </div>
            <div className="p-3">
              <p className="text-[8px] tracking-[0.2em] text-gold/60 uppercase">{draft.brand || 'Brand'}</p>
              <p className="mt-1 truncate text-[13px] text-ivory">{draft.name || 'Untitled piece'}</p>
              <p className="mt-0.5 truncate text-[9px] text-ivory/30">
                {[draft.collection, draft.reference].filter(Boolean).join(' · ') || 'Collection · Reference'}
              </p>
              <p className="mt-2 text-[13px] text-ivory">{money(Number(draft.price) || 0, draft.currency)}</p>
            </div>
          </div>

          <div className="border border-ivory/10 bg-white/[0.015] p-3">
            <p className="text-[9px] tracking-[0.18em] text-ivory/30 uppercase">Checklist</p>
            <ul className="mt-2 space-y-1.5">
              {[
                { label: 'Name & brand', done: Boolean(draft.name && draft.brand) },
                { label: 'At least one photo', done: draft.images.length > 0 },
                { label: 'Price set', done: Number(draft.price) > 0 },
                { label: 'Description written', done: Boolean(draft.shortDescription) },
                { label: 'Published', done: draft.published },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-[10px]">
                  <span
                    className={cx(
                      'grid size-3.5 place-items-center border',
                      item.done ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300' : 'border-ivory/15',
                    )}
                  >
                    {item.done && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  <span className={item.done ? 'text-ivory/60' : 'text-ivory/25'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2 border border-gold/20 bg-gold/[0.04] p-3">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold/70" />
            <p className="text-[10px] leading-relaxed text-ivory/45">
              Tip: photograph on a neutral surface with one light source. Consistent covers make the
              catalogue feel like a magazine.
            </p>
          </div>
        </div>
      </aside>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this watch?">
        <p className="text-xs leading-relaxed text-ivory/50">
          {draft.brand} {draft.name} will be permanently removed.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border border-ivory/10 bg-white/[0.012] p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-ivory/8 pb-3">
        <h2 className="text-[11px] tracking-[0.18em] text-ivory/85 uppercase">{title}</h2>
        {description && <p className="hidden text-[10px] text-ivory/25 sm:block">{description}</p>}
      </div>
      {children}
    </section>
  );
}
