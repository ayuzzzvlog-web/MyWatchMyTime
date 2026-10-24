import { useEffect, useState } from 'react';
import { CalendarClock, Check, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Watch } from '../lib/types';
import { api, ApiError } from '../lib/api';
import { useSettings, useToast } from '../lib/store';
import { Button, Field, Input, Modal, Textarea } from './ui';
import { cx } from '../lib/format';

type InquiryType = 'viewing' | 'enquiry' | 'price' | 'general';

const TYPES: { value: InquiryType; label: string }[] = [
  { value: 'viewing', label: 'Private viewing' },
  { value: 'enquiry', label: 'General enquiry' },
  { value: 'price', label: 'Best price' },
];

export function EnquiryDialog({
  open,
  onClose,
  watch,
  initialType = 'enquiry',
}: {
  open: boolean;
  onClose: () => void;
  watch?: Watch | null;
  initialType?: InquiryType;
}) {
  const { settings } = useSettings();
  const { push } = useToast();
  const [type, setType] = useState<InquiryType>(initialType);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [preferred, setPreferred] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setType(initialType);
      setDone(false);
      setErrors({});
    }
  }, [open, initialType]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onClose, 3200);
      return () => clearTimeout(t);
    }
  }, [done, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please share your name';
    if (!/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const note = form.message.trim();
      const when = preferred
        ? `\n\nPreferred appointment: ${new Date(preferred).toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}`
        : '';
      const base =
        note ||
        (watch
          ? `I'd like to know more about the ${watch.brand} ${watch.name} (${watch.reference}).`
          : '');
      await api.createInquiry({
        ...form,
        message: `${base}${when}`.trim(),
        type,
        watchId: watch?.id ?? null,
      });
      setDone(true);
      setForm({ name: '', phone: '', email: '', message: '' });
      setPreferred('');
      push({ title: 'Enquiry sent', description: 'We reply within one working day.', tone: 'success' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not send your enquiry';
      push({ title: message, description: 'Please try again, or call us directly.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappHref = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    watch
      ? `Hello ${settings.brandName}, I'm interested in the ${watch.brand} ${watch.name} (${watch.reference}).`
      : `Hello ${settings.brandName}, I'd like to book a viewing.`,
  )}`;

  return (
    <Modal open={open} onClose={onClose} title={done ? undefined : watch ? watch.name : 'Enquire'}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 text-center"
          >
            <div className="mx-auto grid size-14 place-items-center rounded-full border border-gold/40 bg-gold/10">
              <Check className="size-6 text-gold" />
            </div>
            <h3 className="display mt-5 text-3xl text-ivory">Thank you.</h3>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-ivory/45">
              Your enquiry is with us. A curator will reach out on WhatsApp within one working day.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {watch && (
              <div className="flex items-center gap-3 border border-ivory/10 bg-white/[0.02] p-2.5">
                <img src={watch.images[0]} alt="" className="size-14 object-cover" />
                <div className="min-w-0">
                  <p className="text-[9px] tracking-[0.2em] text-gold/70 uppercase">{watch.brand}</p>
                  <p className="truncate text-sm text-ivory">{watch.name}</p>
                  <p className="text-[10px] text-ivory/35">{watch.reference}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cx(
                    'border px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] uppercase transition-colors',
                    type === option.value
                      ? 'border-gold bg-gold/12 text-gold-soft'
                      : 'border-ivory/12 text-ivory/40 hover:border-ivory/25 hover:text-ivory/70',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone / WhatsApp" error={errors.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <Field label="Email" optional error={errors.email}>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
            </Field>

            {type === 'viewing' && (
              <Field label="Preferred date & time" optional hint="We confirm by phone">
                <Input
                  type="datetime-local"
                  value={preferred}
                  onChange={(e) => setPreferred(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="[color-scheme:dark]"
                />
              </Field>
            )}

            <Field label="Message" optional>
              <Textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={watch ? 'Anything specific you would like to know?' : 'Tell us what you are looking for…'}
              />
            </Field>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button type="submit" loading={submitting} icon={<Send className="size-3.5" />} className="flex-1">
                Send enquiry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(whatsappHref, '_blank', 'noopener')}
                icon={<CalendarClock className="size-3.5" />}
              >
                WhatsApp
              </Button>
            </div>
            <p className="text-center text-[10px] leading-relaxed text-ivory/25">
              {settings.viewingNote || 'Every viewing is private, unhurried and by appointment.'}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
