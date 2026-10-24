import { useState } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useSettings, useToast } from '../lib/store';
import { Button, Field, Input, Reveal, Select, Textarea } from '../components/ui';
import { cx } from '../lib/format';

export default function Contact() {
  const { settings } = useSettings();
  const { push } = useToast();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'viewing',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please share your name';
    if (!/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await api.createInquiry({ ...form, watchId: null });
      setSent(true);
      setForm({ name: '', phone: '', email: '', type: 'viewing', message: '' });
      push({ title: 'Message sent', description: 'We will reply within one working day.', tone: 'success' });
    } catch (error) {
      push({
        title: error instanceof ApiError ? error.message : 'Could not send',
        tone: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const details = [
    { icon: MapPin, label: 'The showroom', value: settings.address },
    { icon: Clock, label: 'Opening hours', value: settings.hours },
    { icon: Phone, label: 'Call us', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="border-b border-ivory/8 py-14 sm:py-20">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="label text-gold/85">Visit</span>
          </div>
          <h1 className="display mt-5 max-w-[18ch] text-[clamp(2.6rem,6vw,4.8rem)] text-ivory">
            Book a private <em className="text-gold-soft not-italic">viewing</em>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/45">{settings.viewingNote}</p>
        </Reveal>
      </div>

      <div className="grid gap-12 py-14 lg:grid-cols-[1fr_400px] lg:gap-20">
        {/* form */}
        <div>
          <h2 className="text-[10px] tracking-[0.24em] text-gold/85 uppercase">Send a message</h2>
          {sent ? (
            <div className="mt-8 border border-gold/25 bg-gold/[0.04] p-8 text-center">
              <p className="display text-3xl text-ivory">Message received.</p>
              <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-ivory/45">
                A curator will be in touch shortly. If it is urgent, call us — we usually pick up.
              </p>
              <Button variant="outline" size="sm" className="mt-6" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
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
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" optional error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
                <Field label="What is it about?">
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="viewing">Private viewing</option>
                    <option value="enquiry">A specific watch</option>
                    <option value="price">Pricing question</option>
                    <option value="general">Something else</option>
                  </Select>
                </Field>
              </div>
              <Field label="Message" optional>
                <Textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us which pieces caught your eye, or what you are looking for…"
                />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={sending} size="lg" icon={<Send className="size-3.5" />}>
                  Send message
                </Button>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cx(
                    'inline-flex h-14 items-center gap-2 border border-ivory/18 px-6 text-[11px] tracking-[0.18em] text-ivory/80 uppercase transition-colors hover:border-[#25D366]/60 hover:text-[#25D366]',
                  )}
                >
                  <MessageCircle className="size-3.5" /> WhatsApp us
                </a>
              </div>
              <p className="text-[10px] leading-relaxed text-ivory/25">
                We only use your details to answer this enquiry. No lists, no marketing.
              </p>
            </form>
          )}
        </div>

        {/* details */}
        <aside className="space-y-px bg-ivory/8">
          {details.map((item) => (
            <div key={item.label} className="bg-[#08080a] p-6">
              <div className="flex items-center gap-2.5">
                <item.icon className="size-3.5 text-gold/70" />
                <p className="text-[9px] tracking-[0.2em] text-ivory/35 uppercase">{item.label}</p>
              </div>
              {item.href ? (
                <a href={item.href} className="mt-2 block text-sm text-ivory/85 hover:text-gold">
                  {item.value}
                </a>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-ivory/85">{item.value}</p>
              )}
            </div>
          ))}
          <div className="relative h-56 overflow-hidden bg-[#0c0c10]">
            <div className="absolute inset-0 opacity-[0.13]">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#c9a46a" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M0 150 Q 120 120 240 160 T 400 130" fill="none" stroke="#c9a46a" strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="relative grid size-3 place-items-center">
                <span className="absolute inline-flex size-8 animate-ping rounded-full bg-gold/25" />
                <span className="relative size-2 rounded-full bg-gold" />
              </span>
              <p className="mt-3 text-[10px] tracking-[0.2em] text-ivory/70 uppercase">Boring Road · Patna</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 border border-ivory/20 px-4 py-2 text-[9px] tracking-[0.18em] text-ivory/60 uppercase transition-colors hover:border-gold/60 hover:text-gold"
              >
                Open in maps
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
