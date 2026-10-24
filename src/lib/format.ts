const currencySymbols: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  AUD: 'A$',
};

export function money(value: number, currency = 'INR', compact = false) {
  const symbol = currencySymbols[currency] ?? `${currency} `;
  if (compact && value >= 100000) return `${symbol}${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  return `${symbol}${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function availabilityTone(value: string) {
  switch (value) {
    case 'In Showroom':
      return { dot: 'bg-emerald-400', text: 'text-emerald-200/90', ring: 'border-emerald-400/25 bg-emerald-400/8' };
    case 'Reserved':
      return { dot: 'bg-amber-400', text: 'text-amber-200/90', ring: 'border-amber-400/25 bg-amber-400/8' };
    case 'Made to Order':
      return { dot: 'bg-sky-400', text: 'text-sky-200/90', ring: 'border-sky-400/25 bg-sky-400/8' };
    default:
      return { dot: 'bg-rose-400', text: 'text-rose-200/90', ring: 'border-rose-400/25 bg-rose-400/8' };
  }
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function specRows(watch: {
  brand: string;
  reference: string;
  collection: string;
  category: string;
  gender: string;
  movement: string;
  caseMaterial: string;
  caseSize: number | null;
  caseThickness: number | null;
  dialColor: string;
  strap: string;
  crystal: string;
  waterResistance: string;
  condition: string;
  availability: string;
}) {
  return [
    { label: 'Brand', value: watch.brand },
    { label: 'Reference', value: watch.reference },
    { label: 'Collection', value: watch.collection },
    { label: 'Category', value: watch.category },
    { label: 'Worn by', value: watch.gender },
    { label: 'Movement', value: watch.movement },
    { label: 'Case', value: watch.caseMaterial },
    { label: 'Case size', value: watch.caseSize ? `${watch.caseSize} mm` : '' },
    { label: 'Thickness', value: watch.caseThickness ? `${watch.caseThickness} mm` : '' },
    { label: 'Dial', value: watch.dialColor },
    { label: 'Strap', value: watch.strap },
    { label: 'Crystal', value: watch.crystal },
    { label: 'Water resistance', value: watch.waterResistance },
    { label: 'Condition', value: watch.condition },
    { label: 'Availability', value: watch.availability },
  ].filter((row) => row.value);
}
