export type Availability = 'In Showroom' | 'Reserved' | 'Made to Order' | 'Sold Out';

export interface Watch {
  id: string;
  slug: string;
  name: string;
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
  availability: Availability;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  shortDescription: string;
  description: string;
  story: string;
  highlights: string[];
  tags: string[];
  badge: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: 'viewing' | 'enquiry' | 'price' | 'general';
  watchId: string | null;
  watchName: string | null;
  status: 'new' | 'contacted' | 'closed';
  note: string;
  createdAt: string;
}

export interface Settings {
  brandName: string;
  brandMark: string;
  tagline: string;
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  aboutHeading: string;
  aboutText: string;
  viewingNote: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  youtube: string;
  currency: string;
  showPrices: boolean;
  footerNote: string;
}

export interface AdminRecord {
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

export interface Database {
  version: number;
  watches: Watch[];
  inquiries: Inquiry[];
  settings: Settings;
  admin: AdminRecord | null;
}

export interface WatchStats {
  total: number;
  published: number;
  featured: number;
  brands: number;
  inShowroom: number;
  totalViews: number;
  inquiries: { new: number; total: number };
  byCategory: { name: string; count: number }[];
  byBrand: { name: string; count: number }[];
  recentlyAdded: { id: string; name: string; createdAt: string }[];
}
