import type { Facets, Inquiry, Settings, Watch, WatchStats } from './types';

const TOKEN_KEY = 'ut_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  issues?: unknown;
  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const res = await fetch(`/api${path}`, { ...init, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    if (res.status === 401 && token) tokenStore.clear();
    throw new ApiError(payload?.error || `Request failed (${res.status})`, res.status, payload?.issues);
  }
  return payload as T;
}

export interface WatchQuery {
  q?: string;
  brand?: string[];
  category?: string[];
  gender?: string[];
  movement?: string[];
  availability?: string[];
  condition?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  includeUnpublished?: boolean;
}

export function buildQuery(query: WatchQuery): string {
  const params = new URLSearchParams();
  const addList = (key: string, value?: string[]) => {
    if (value?.length) params.set(key, value.join(','));
  };
  if (query.q) params.set('q', query.q);
  addList('brand', query.brand);
  addList('category', query.category);
  addList('gender', query.gender);
  addList('movement', query.movement);
  addList('availability', query.availability);
  addList('condition', query.condition);
  if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));
  if (query.featured) params.set('featured', '1');
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.includeUnpublished) params.set('includeUnpublished', '1');
  return params.toString();
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export const api = {
  watches: (query: WatchQuery = {}) => request<Paginated<Watch>>(`/watches?${buildQuery(query)}`),
  watch: (idOrSlug: string) => request<{ watch: Watch; related: Watch[] }>(`/watches/${idOrSlug}`),
  facets: () => request<Facets>('/watches/facets'),
  createWatch: (body: Partial<Watch>) =>
    request<{ watch: Watch }>('/watches', { method: 'POST', body: JSON.stringify(body) }),
  updateWatch: (id: string, body: Partial<Watch>) =>
    request<{ watch: Watch }>(`/watches/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  patchWatch: (id: string, body: Partial<Watch>) =>
    request<{ watch: Watch }>(`/watches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  duplicateWatch: (id: string) =>
    request<{ watch: Watch }>(`/watches/${id}/duplicate`, { method: 'POST' }),
  deleteWatch: (id: string) => request<{ ok: true }>(`/watches/${id}`, { method: 'DELETE' }),
  reorder: (ids: string[]) => request<{ ok: true }>('/watches/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),

  settings: () => request<{ settings: Settings }>('/settings'),
  updateSettings: (body: Partial<Settings>) =>
    request<{ settings: Settings }>('/settings', { method: 'PUT', body: JSON.stringify(body) }),

  createInquiry: (body: Record<string, unknown>) =>
    request<{ ok: true; message: string }>('/inquiries', { method: 'POST', body: JSON.stringify(body) }),
  inquiries: () => request<{ items: Inquiry[] }>('/inquiries'),
  updateInquiry: (id: string, body: { status?: string; note?: string }) =>
    request<{ inquiry: Inquiry }>(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteInquiry: (id: string) => request<{ ok: true }>(`/inquiries/${id}`, { method: 'DELETE' }),

  stats: () => request<{ stats: WatchStats }>('/stats'),

  login: (password: string) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  session: () => request<{ ok: true }>('/auth/session'),
  changePassword: (current: string, next: string) =>
    request<{ ok: true; token: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ current, next }),
    }),

  async uploadImages(files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return request<{ files: { url: string; name: string; size: number }[] }>('/uploads', {
      method: 'POST',
      body: form,
    });
  },
  deleteUpload: (url: string) => {
    const filename = url.split('/').pop() || '';
    return request<{ ok: true }>(`/uploads/${filename}`, { method: 'DELETE' });
  },
};
