import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Check, ChevronDown, Loader2, Minus, Plus, X } from 'lucide-react';
import { cx } from '../lib/format';

/* ------------------------------ Button ------------------------------ */
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'dark' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonBase =
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium uppercase tracking-[0.18em] transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-ink hover:bg-gold-soft shadow-[0_0_0_0_rgba(201,164,106,0.4)] hover:shadow-[0_10px_40px_-12px_rgba(201,164,106,0.65)]',
  outline:
    'border border-ivory/22 text-ivory hover:border-gold/70 hover:text-gold-soft hover:bg-gold/5',
  ghost: 'text-muted hover:text-ivory',
  dark: 'bg-ink-2 text-ivory border border-line hover:border-gold/50 hover:bg-surface-2',
  danger: 'border border-rose-500/40 text-rose-200 hover:bg-rose-500/10',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[10px]',
  md: 'h-11 px-6 text-[11px]',
  lg: 'h-14 px-9 text-[11px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, iconRight, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
});

/* ------------------------------- Badge ------------------------------ */
export function Badge({
  children,
  tone = 'gold',
  className,
}: {
  children: ReactNode;
  tone?: 'gold' | 'neutral' | 'solid';
  className?: string;
}) {
  const tones = {
    gold: 'border-gold/35 bg-gold/8 text-gold-soft',
    neutral: 'border-ivory/15 bg-ivory/5 text-ivory/70',
    solid: 'border-transparent bg-ivory text-ink',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------- Field ------------------------------ */
export function Field({
  label,
  hint,
  error,
  children,
  className,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory/55">
          {label}
          {optional && <span className="ml-1.5 text-ivory/25 normal-case tracking-normal">(optional)</span>}
        </span>
        {hint && !error && <span className="text-[10px] text-ivory/30">{hint}</span>}
        {error && <span className="text-[10px] text-rose-300">{error}</span>}
      </span>
      {children}
    </label>
  );
}

const controlBase =
  'w-full border border-ivory/12 bg-white/[0.02] px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/25 transition-colors duration-300 hover:border-ivory/22 focus:border-gold/70 focus:bg-white/[0.04] focus:outline-none';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cx(controlBase, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cx(controlBase, 'resize-y leading-relaxed', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cx(controlBase, 'appearance-none pr-9 [&>option]:bg-[#141417]', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-ivory/40" />
      </div>
    );
  },
);

/* ------------------------------ Toggle ------------------------------ */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 border border-ivory/10 bg-white/[0.015] px-4 py-3 text-left transition-colors hover:border-ivory/20"
    >
      <span>
        <span className="block text-xs font-medium tracking-wide text-ivory/85">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] text-ivory/35">{description}</span>}
      </span>
      <span
        className={cx(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-gold' : 'bg-ivory/15',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-4 rounded-full bg-ink transition-transform duration-300',
            checked ? 'translate-x-4.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  );
}

/* ------------------------------ Checkbox ---------------------------- */
export function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex w-full items-center gap-2.5 py-1.5 text-left"
    >
      <span
        className={cx(
          'flex size-3.5 shrink-0 items-center justify-center border transition-all duration-300',
          checked ? 'border-gold bg-gold text-ink' : 'border-ivory/25 group-hover:border-gold/60',
        )}
      >
        {checked && <Check className="size-2.5" strokeWidth={3.5} />}
      </span>
      <span
        className={cx(
          'flex-1 text-[12px] transition-colors',
          checked ? 'text-ivory' : 'text-ivory/55 group-hover:text-ivory/85',
        )}
      >
        {label}
      </span>
      {count != null && <span className="text-[10px] tabular-nums text-ivory/25">{count}</span>}
    </button>
  );
}

/* ------------------------------- Modal ------------------------------ */
export function Modal({
  open,
  onClose,
  children,
  title,
  wide,
  bare,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  wide?: boolean;
  bare?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/78 backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={cx(
              'relative z-10 max-h-[92vh] w-full overflow-y-auto border border-ivory/12 bg-[#0c0c0f] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]',
              wide ? 'max-w-4xl' : 'max-w-lg',
              bare ? '' : 'p-6 sm:p-8',
            )}
          >
            {(title || !bare) && (
              <div className="mb-6 flex items-start justify-between gap-6">
                {title && (
                  <h2 className="display text-3xl font-light text-ivory">{title}</h2>
                )}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-auto grid size-9 shrink-0 place-items-center border border-ivory/15 text-ivory/60 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
            {bare && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 z-20 grid size-10 place-items-center border border-ivory/15 bg-black/40 text-ivory/70 backdrop-blur transition-colors hover:border-gold/60 hover:text-gold"
              >
                <X className="size-4" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------- Drawer ----------------------------- */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cx(
              'absolute top-0 bottom-0 flex w-full max-w-md flex-col border-ivory/10 bg-[#0b0b0e]',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-ivory/10 px-6 py-5">
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold-soft">{title}</h2>
                {subtitle && <p className="mt-1.5 text-xs text-ivory/40">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 place-items-center border border-ivory/15 text-ivory/60 transition-colors hover:border-gold/60 hover:text-gold"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-ivory/10 px-6 py-5">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------ Reveal ------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------ Counter ----------------------------- */
export function Counter({
  to,
  suffix = '',
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

/* --------------------------- Section heading ------------------------ */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
      )}
    >
      <div className={cx('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <div className={cx('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
            <span className="h-px w-8 bg-gold/60" />
            <span className="label text-gold/85">{eyebrow}</span>
          </div>
        )}
        <h2 className="display text-[clamp(2rem,4.4vw,3.6rem)] text-ivory">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/45">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ Skeleton ---------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx('animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]', className)}
    />
  );
}

/* ------------------------------ Stepper ----------------------------- */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-ivory/12">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-8 place-items-center text-ivory/50 transition-colors hover:text-gold"
        aria-label="Decrease"
      >
        <Minus className="size-3" />
      </button>
      <span className="w-8 text-center text-xs tabular-nums text-ivory">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-8 place-items-center text-ivory/50 transition-colors hover:text-gold"
        aria-label="Increase"
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

/* ---------------------------- Segmented ----------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx('inline-flex border border-ivory/12 p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={`${id}-${opt.value}`}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'relative px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors duration-300',
            value === opt.value ? 'text-ink' : 'text-ivory/45 hover:text-ivory/80',
          )}
        >
          {value === opt.value && (
            <motion.span
              layoutId={`segmented-${id}`}
              className="absolute inset-0 bg-gold"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
