import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth';
import { ApiError } from '../../lib/api';
import { Button } from '../../components/ui';
import { LiveDial } from '../../components/LiveDial';

export function AdminLogin() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] px-5">
      <div className="absolute inset-0 opacity-20">
        <img src="/images/w5.jpg" alt="" className="size-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/85 to-[#060608]/60" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LiveDial className="w-20" />
          <p className="mt-6 text-[10px] tracking-[0.3em] text-gold/80 uppercase">Catalogue Manager</p>
          <h1 className="display mt-3 text-3xl text-ivory">Curator access</h1>
          <p className="mt-2 text-[11px] text-ivory/35">Sign in to manage watches, enquiries and settings.</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-ivory/10 bg-[#0a0a0d]/80 p-6 backdrop-blur-xl">
          <label className="block">
            <span className="mb-2 block text-[10px] tracking-[0.2em] text-ivory/45 uppercase">Password</span>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ivory/30" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                placeholder="••••••••"
                className="w-full border border-ivory/12 bg-white/[0.02] py-3 pr-10 pl-9 text-sm tracking-widest text-ivory placeholder:text-ivory/20 focus:border-gold/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ivory/30 hover:text-ivory"
              >
                {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </label>

          {error && (
            <p className="border border-rose-400/25 bg-rose-400/8 px-3 py-2 text-[11px] text-rose-200">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Enter dashboard
          </Button>

          <p className="pt-1 text-center text-[10px] leading-relaxed text-ivory/25">
            First time? The default password is <span className="text-gold/70">unique2026</span> — change it in
            Settings immediately.
          </p>
        </form>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-[10px] tracking-[0.18em] text-ivory/30 uppercase transition-colors hover:text-ivory"
        >
          <ArrowLeft className="size-3" /> Back to the catalogue
        </Link>
      </motion.div>
    </div>
  );
}
