import { AnimatePresence, motion } from 'motion/react';
import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { useToast } from '../lib/store';
import { cx } from '../lib/format';

export function Toasts() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cx(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-[#0c0c0f]/95 px-4 py-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur',
              toast.tone === 'error'
                ? 'border-rose-400/30'
                : toast.tone === 'success'
                  ? 'border-emerald-400/30'
                  : 'border-ivory/14',
            )}
          >
            <span
              className={cx(
                'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                toast.tone === 'error'
                  ? 'bg-rose-400/12 text-rose-300'
                  : toast.tone === 'success'
                    ? 'bg-emerald-400/12 text-emerald-300'
                    : 'bg-gold/12 text-gold',
              )}
            >
              {toast.tone === 'error' ? (
                <TriangleAlert className="size-3.5" />
              ) : toast.tone === 'success' ? (
                <Check className="size-3.5" />
              ) : (
                <Info className="size-3.5" />
              )}
            </span>
            <div className="flex-1">
              <p className="text-[12px] font-medium tracking-wide text-ivory">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] leading-relaxed text-ivory/45">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="text-ivory/30 transition-colors hover:text-ivory"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
