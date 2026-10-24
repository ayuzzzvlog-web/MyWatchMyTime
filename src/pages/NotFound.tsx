import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { LiveDial } from '../components/LiveDial';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-20 text-center">
      <LiveDial className="w-28 opacity-80" />
      <p className="display mt-10 text-6xl text-ivory">404</p>
      <p className="mt-3 text-[10px] tracking-[0.26em] text-gold/70 uppercase">Time well spent elsewhere</p>
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/40">
        This page is off the dial. The collection, however, is very much on time.
      </p>
      <Link to="/collection" className="mt-8">
        <Button variant="outline">Browse the collection</Button>
      </Link>
    </div>
  );
}
