import { useEffect, useState } from 'react';
import { Check, KeyRound, Save } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Settings } from '../../lib/types';
import { useSettings, useToast } from '../../lib/store';
import { Button, Field, Input, Textarea, Toggle } from '../../components/ui';
import { ImageUploader } from '../../components/admin/ImageUploader';

export function SettingsAdmin() {
  const { settings, setLocal, refresh } = useSettings();
  const { push } = useToast();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  useEffect(() => setDraft(settings), [settings]);
  useEffect(() => {
    setDirty(JSON.stringify(draft) !== JSON.stringify(settings));
  }, [draft, settings]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const { settings: updated } = await api.updateSettings(draft);
      setLocal(updated);
      setDirty(false);
      push({ title: 'Settings saved', tone: 'success' });
    } catch (error) {
      push({
        title: error instanceof ApiError ? error.message : 'Could not save settings',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.next !== passwords.confirm) {
      push({ title: 'New passwords do not match', tone: 'error' });
      return;
    }
    setChanging(true);
    try {
      await api.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      push({ title: 'Password updated', description: 'Use it next time you sign in.', tone: 'success' });
    } catch (error) {
      push({ title: error instanceof ApiError ? error.message : 'Could not change password', tone: 'error' });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5 pb-24">
      <Section title="Identity" description="How the brand presents itself everywhere.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <Input value={draft.brandName} onChange={(e) => set('brandName', e.target.value)} />
          </Field>
          <Field label="Monogram" hint="1–2 characters">
            <Input
              value={draft.brandMark}
              maxLength={2}
              onChange={(e) => set('brandMark', e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Tagline">
            <Input value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Announcement strip">
            <Input value={draft.announcement} onChange={(e) => set('announcement', e.target.value)} />
          </Field>
          <Field label="Footer note" className="sm:col-span-2">
            <Input value={draft.footerNote} onChange={(e) => set('footerNote', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Homepage hero" description="The first thing a client sees.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <Input value={draft.heroEyebrow} onChange={(e) => set('heroEyebrow', e.target.value)} />
          </Field>
          <Field label="Headline">
            <Input value={draft.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
          </Field>
          <Field label="Subtitle" className="sm:col-span-2">
            <Textarea rows={3} value={draft.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} />
          </Field>
          <Field label="Primary button">
            <Input value={draft.heroPrimaryCta} onChange={(e) => set('heroPrimaryCta', e.target.value)} />
          </Field>
          <Field label="Secondary button">
            <Input value={draft.heroSecondaryCta} onChange={(e) => set('heroSecondaryCta', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Hero image">
            <div className="space-y-2">
              {draft.heroImage && (
                <img src={draft.heroImage} alt="" className="h-28 w-full object-cover" />
              )}
              <ImageUploader value={draft.heroImage ? [draft.heroImage] : []} onChange={(images) => set('heroImage', images[0] || '')} />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="About the house" description="Shown on the homepage and The House page.">
        <div className="space-y-4">
          <Field label="Heading">
            <Input value={draft.aboutHeading} onChange={(e) => set('aboutHeading', e.target.value)} />
          </Field>
          <Field label="Story">
            <Textarea rows={5} value={draft.aboutText} onChange={(e) => set('aboutText', e.target.value)} />
          </Field>
          <Field label="Viewing note">
            <Input value={draft.viewingNote} onChange={(e) => set('viewingNote', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Contact & showroom" description="Used across the footer, contact page and enquiry links.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <Input value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="WhatsApp number" hint="With country code, digits only">
            <Input value={draft.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={draft.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Opening hours">
            <Input value={draft.hours} onChange={(e) => set('hours', e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={draft.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <Field label="Instagram URL">
            <Input value={draft.instagram} onChange={(e) => set('instagram', e.target.value)} />
          </Field>
          <Field label="Facebook URL">
            <Input value={draft.facebook} onChange={(e) => set('facebook', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Catalogue behaviour" description="How prices are presented to clients.">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle
            checked={draft.showPrices}
            onChange={(v) => set('showPrices', v)}
            label="Show prices publicly"
            description="Turn off for a strict enquiry-only catalogue"
          />
          <Field label="Default currency">
            <Input value={draft.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} />
          </Field>
        </div>
      </Section>

      <Section title="Security" description="Change the password used to reach this dashboard.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <Input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <Input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <Button
          className="mt-4"
          variant="dark"
          size="sm"
          loading={changing}
          onClick={changePassword}
          icon={<KeyRound className="size-3" />}
          disabled={!passwords.current || !passwords.next}
        >
          Update password
        </Button>
      </Section>

      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-ivory/10 bg-[#08080a]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <p className="text-[10px] text-ivory/30">
          {dirty ? 'Unsaved changes' : 'Everything is saved'}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDraft(settings)} disabled={!dirty}>
            Discard
          </Button>
          <Button size="sm" loading={saving} onClick={save} icon={<Save className="size-3" />} disabled={!dirty}>
            Save settings
          </Button>
        </div>
      </div>

      <button
        onClick={() => void refresh()}
        className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] text-ivory/20 uppercase hover:text-ivory/50"
      >
        <Check className="size-3" /> Reload from server
      </button>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ivory/10 bg-white/[0.012] p-5">
      <div className="mb-4 border-b border-ivory/8 pb-3">
        <h2 className="text-[11px] tracking-[0.18em] text-ivory/85 uppercase">{title}</h2>
        {description && <p className="mt-1 text-[10px] text-ivory/25">{description}</p>}
      </div>
      {children}
    </section>
  );
}
