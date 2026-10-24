import { useEffect, useState } from 'react';

/** A real, ticking watch dial — the small "one honest detail" in the hero. */
export function LiveDial({ className }: { className?: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const hand = (deg: number, length: number, width: number, color: string, tail = 8) => (
    <g transform={`rotate(${deg} 50 50)`}>
      <line x1="50" y1={50 - length} x2="50" y2={50 + tail} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </g>
  );

  return (
    <div className={className}>
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 100 100" className="size-full">
          <defs>
            <radialGradient id="dialFace" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#16161a" />
              <stop offset="70%" stopColor="#0b0b0e" />
              <stop offset="100%" stopColor="#050506" />
            </radialGradient>
            <linearGradient id="bezelGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0d9b0" />
              <stop offset="45%" stopColor="#c9a46a" />
              <stop offset="100%" stopColor="#6d5329" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#bezelGold)" opacity="0.9" />
          <circle cx="50" cy="50" r="45" fill="#0a0a0c" />
          <circle cx="50" cy="50" r="42.5" fill="url(#dialFace)" stroke="#2a2a30" strokeWidth="0.4" />
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1="50"
                y1={major ? 12 : 13.5}
                x2="50"
                y2={major ? 17 : 15}
                stroke={major ? '#c9a46a' : '#4a4a52'}
                strokeWidth={major ? 0.9 : 0.35}
                transform={`rotate(${i * 6} 50 50)`}
              />
            );
          })}
          <circle cx="50" cy="50" r="1.2" fill="#c9a46a" opacity="0.55" />
          {hand(hours * 30, 22, 2.1, '#efe9dd', 6)}
          {hand(minutes * 6, 32, 1.4, '#efe9dd', 7)}
          {hand(seconds * 6, 35, 0.7, '#c9a46a', 10)}
          <circle cx="50" cy="50" r="2.4" fill="#0b0b0e" stroke="#c9a46a" strokeWidth="0.7" />
        </svg>
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
      </div>
    </div>
  );
}
