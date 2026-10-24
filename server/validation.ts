import { z } from 'zod';

export const availabilityEnum = z.enum(['In Showroom', 'Reserved', 'Made to Order', 'Sold Out']);

export const watchInputSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  brand: z.string().trim().min(1, 'Brand is required').max(80),
  reference: z.string().trim().max(80).default(''),
  collection: z.string().trim().max(80).default(''),
  category: z.string().trim().max(60).default('Everyday'),
  gender: z.string().trim().max(40).default('Unisex'),
  movement: z.string().trim().max(60).default('Automatic'),
  caseMaterial: z.string().trim().max(60).default(''),
  caseSize: z.coerce.number().min(0).max(80).nullable().optional(),
  caseThickness: z.coerce.number().min(0).max(40).nullable().optional(),
  dialColor: z.string().trim().max(60).default(''),
  strap: z.string().trim().max(80).default(''),
  crystal: z.string().trim().max(80).default(''),
  waterResistance: z.string().trim().max(60).default(''),
  condition: z.string().trim().max(60).default('Unworn'),
  availability: availabilityEnum.default('In Showroom'),
  price: z.coerce.number().min(0).max(100_000_000),
  compareAtPrice: z.coerce.number().min(0).max(100_000_000).nullable().optional(),
  currency: z.string().trim().length(3).default('INR'),
  images: z.array(z.string().trim().min(1)).max(12).default([]),
  shortDescription: z.string().trim().max(240).default(''),
  description: z.string().trim().max(6000).default(''),
  story: z.string().trim().max(6000).default(''),
  highlights: z.array(z.string().trim().max(160)).max(12).default([]),
  tags: z.array(z.string().trim().max(40)).max(16).default([]),
  badge: z.string().trim().max(40).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().optional(),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Please share your name').max(80),
  email: z.string().trim().email('Enter a valid email').max(160).or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(24)
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  message: z.string().trim().max(2000).default(''),
  type: z.enum(['viewing', 'enquiry', 'price', 'general']).default('enquiry'),
  watchId: z.string().trim().max(60).nullable().optional(),
});

export const settingsSchema = z.object({
  brandName: z.string().trim().min(1).max(60),
  brandMark: z.string().trim().max(4),
  tagline: z.string().trim().max(80),
  announcement: z.string().trim().max(160),
  heroEyebrow: z.string().trim().max(80),
  heroTitle: z.string().trim().max(120),
  heroSubtitle: z.string().trim().max(400),
  heroImage: z.string().trim().max(500),
  heroPrimaryCta: z.string().trim().max(40),
  heroSecondaryCta: z.string().trim().max(40),
  aboutHeading: z.string().trim().max(120),
  aboutText: z.string().trim().max(2000),
  viewingNote: z.string().trim().max(200),
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().max(24),
  email: z.string().trim().max(120),
  address: z.string().trim().max(240),
  hours: z.string().trim().max(120),
  instagram: z.string().trim().max(240),
  facebook: z.string().trim().max(240),
  youtube: z.string().trim().max(240),
  currency: z.string().trim().length(3),
  showPrices: z.boolean(),
  footerNote: z.string().trim().max(240),
});

export type WatchInput = z.infer<typeof watchInputSchema>;
