/**
 * Production Security Utilities for MyMall
 * Comprehensive protection for XSS prevention, JWT validation, safe storage, and file upload integrity.
 */

// ==========================================
// 1. XSS Prevention & Text Sanitization
// ==========================================

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes characters that could lead to Cross-Site Scripting (XSS).
 */
export function sanitizeText(input?: string | null): string {
  if (!input) return '';
  return String(input).replace(/[&<>"'/]/g, (match) => HTML_ESCAPE_MAP[match] || match);
}

/**
 * Strips script tags, javascript: protocols, and event handlers.
 */
export function sanitizeSafeString(input?: string | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// ==========================================
// 2. JWT Validation & Proactive Expiration Check
// ==========================================

export interface JwtPayload {
  id?: string;
  userId?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Validates whether a string is a syntactically valid JWT (header.payload.signature).
 */
export function isValidJwt(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Safely decodes a JWT payload without invoking eval.
 */
export function decodeJwt(token?: string | null): JwtPayload | null {
  if (!isValidJwt(token)) return null;
  try {
    const payloadPart = token!.split('.')[1];
    // Base64URL decode
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT is expired with a configurable safety leeway (default: 30 seconds).
 */
export function isJwtExpired(token?: string | null, leewaySeconds = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + leewaySeconds;
}

// ==========================================
// 3. Defensive LocalStorage Wrapper
// ==========================================

class MemoryStorage {
  private store: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const memoryStore = new MemoryStorage();

export const safeStorage = {
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  getItem(key: string): string | null {
    if (this.isAvailable()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore.getItem(key);
      }
    }
    return memoryStore.getItem(key);
  },

  setItem(key: string, value: string): void {
    if (this.isAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory store if quota exceeded or restricted
      }
    }
    memoryStore.setItem(key, value);
  },

  removeItem(key: string): void {
    if (this.isAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    memoryStore.removeItem(key);
  },

  clear(): void {
    if (this.isAvailable()) {
      try {
        window.localStorage.clear();
      } catch {
        // Fallback
      }
    }
    memoryStore.clear();
  },
};

// ==========================================
// 4. File Upload Validation & Integrity
// ==========================================

export interface FileValidationOptions {
  maxSizeMb?: number;
  allowedTypes?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Validates file size and MIME type before sending to the backend.
 */
export function validateUploadedFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const maxSizeMb = options.maxSizeMb || 5;
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

  if (file.size > maxSizeMb * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds the ${maxSizeMb}MB maximum limit.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type}). Allowed formats: ${allowedTypes.join(', ')}`,
    };
  }

  // Prevent path traversal in filename
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid file name detected.',
    };
  }

  return { valid: true };
}

// ==========================================
// 5. Sensitive Data Masking
// ==========================================

/**
 * Masks bank account number or phone number for safe display (e.g. "**** 8472").
 */
export function maskSensitiveNumber(val?: string | null, visibleLastDigits = 4): string {
  if (!val) return '—';
  const clean = String(val).trim();
  if (clean.length <= visibleLastDigits) return clean;
  const masked = '*'.repeat(Math.min(clean.length - visibleLastDigits, 8));
  const visible = clean.slice(-visibleLastDigits);
  return `${masked} ${visible}`;
}

/**
 * Masks email address for privacy (e.g. "l***@gmail.com").
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return email || '—';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
}
