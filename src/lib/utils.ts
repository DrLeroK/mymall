import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | null | undefined, currency = 'ETB'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0.00 ${currency}`;
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getImageUrl(imagePath?: any): string {
  const fallback = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
  if (!imagePath) return fallback;

  let pathStr: string = '';

  if (Array.isArray(imagePath)) {
    pathStr = imagePath.length > 0 ? String(imagePath[0] || '') : '';
  } else if (typeof imagePath === 'string') {
    pathStr = imagePath.trim();
    // In case it is a JSON array string e.g. "[\"https://...\"]"
    if (pathStr.startsWith('[') && pathStr.endsWith(']')) {
      try {
        const parsed = JSON.parse(pathStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          pathStr = String(parsed[0] || '');
        }
      } catch {}
    }
  } else {
    pathStr = String(imagePath || '');
  }

  if (!pathStr || pathStr === 'undefined' || pathStr === 'null') {
    return fallback;
  }

  if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) {
    return pathStr;
  }

  const cleanPath = pathStr.replace(/^\/?uploads\//, '');
  if (process.env.NEXT_PUBLIC_UPLOADS_URL) {
    const base = process.env.NEXT_PUBLIC_UPLOADS_URL.replace(/\/+$/, '');
    return `${base}/${cleanPath}`;
  }
  return `/backend-uploads/${cleanPath}`;
}

export function parseImages(imagesJson?: string | null): string[] {
  if (!imagesJson) return [];
  try {
    const parsed = JSON.parse(imagesJson);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If it's a single URL string
    if (typeof imagesJson === 'string' && imagesJson.trim().length > 0) {
      return [imagesJson.trim()];
    }
  }
  return [];
}
