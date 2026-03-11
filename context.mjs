import {createCookieSessionStorage} from 'react-router';
import {createStorefrontClient, InMemoryCache} from '@shopify/hydrogen';
import crypto from 'node:crypto';

// ── Token encryption helpers (AES-256-GCM) ──────────────────────────────
// Derives a 32-byte key from SESSION_SECRET using SHA-256.
// The encrypted blob is stored as  iv:authTag:ciphertext  (all hex).

function deriveEncryptionKey(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptToken(plaintext, secret) {
  const key = deriveEncryptionKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(blob, secret) {
  if (!blob || typeof blob !== 'string') return undefined;
  const parts = blob.split(':');
  if (parts.length !== 3) return undefined;
  try {
    const key = deriveEncryptionKey(secret);
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch {
    return undefined;
  }
}

// Session abstraction extracted from server.mjs
export class AppSession {
  constructor(sessionStorage, session) {
    this.sessionStorage = sessionStorage;
    this.session = session;
  }

  static async init(request, secrets) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.get('Cookie'))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get(key) { return this.session.get(key); }
  destroy() { return this.sessionStorage.destroySession(this.session); }
  flash(key, value) { this.session.flash(key, value); }
  unset(key) { this.session.unset(key); }
  set(key, value) { this.session.set(key, value); }
  commit() { return this.sessionStorage.commitSession(this.session); }
}

/**
 * Session helpers for customer authentication.
 * Wraps the AppSession class with customer-specific methods.
 * Includes CSRF token management, token encryption, and expiry checks.
 */
export class CustomerSession {
  constructor(session, sessionSecret) {
    this.session = session;
    this._sessionSecret = sessionSecret;
  }

  static headersFromCookie(cookie) {
    const headers = new Headers();
    if (cookie) headers.set('Set-Cookie', cookie);
    return headers;
  }

  static async init(request, secrets) {
    const appSession = await AppSession.init(request, secrets);
    return new this(appSession, secrets[0]);
  }

  // ── Customer token (encrypted at rest) ─────────────────────────────
  getCustomerToken() {
    const blob = this.session.get('customerAccessToken');
    if (!blob) return undefined;
    return decryptToken(blob, this._sessionSecret);
  }

  setCustomerToken(token, expiresAt) {
    const encrypted = encryptToken(token, this._sessionSecret);
    this.session.set('customerAccessToken', encrypted);
    if (expiresAt) {
      this.session.set('customerTokenExpiresAt', expiresAt);
    }
  }

  clearCustomerToken() {
    this.session.unset('customerAccessToken');
    this.session.unset('customerTokenExpiresAt');
  }

  // ── Token expiry ───────────────────────────────────────────────────
  isTokenExpired() {
    const expiresAt = this.session.get('customerTokenExpiresAt');
    if (!expiresAt) return false; // no stored expiry — treat as valid
    return new Date(expiresAt).getTime() <= Date.now();
  }

  getTokenExpiresAt() {
    return this.session.get('customerTokenExpiresAt');
  }

  // ── CSRF token ─────────────────────────────────────────────────────
  getCsrfToken() {
    let token = this.session.get('csrfToken');
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      this.session.set('csrfToken', token);
    }
    return token;
  }

  validateCsrfToken(formToken) {
    const sessionToken = this.session.get('csrfToken');
    if (!sessionToken || !formToken || typeof formToken !== 'string') return false;
    if (sessionToken.length !== formToken.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(sessionToken, 'utf8'),
      Buffer.from(formToken, 'utf8'),
    );
  }

  get(key) {
    return this.session.get(key);
  }

  set(key, value) {
    this.session.set(key, value);
  }

  async commit() {
    return this.session.commit();
  }

  async commitHeaders() {
    const cookie = await this.commit();
    return CustomerSession.headersFromCookie(cookie);
  }

  async destroy() {
    return this.session.destroy();
  }

  async destroyHeaders() {
    const cookie = await this.destroy();
    return CustomerSession.headersFromCookie(cookie);
  }
}

/**
 * Builds the load context for React Router loaders/actions.
 * @param {import('express').Request} req
 * @param {Record<string,string|undefined>} env
 * @param {boolean} debugEnabled
 * @param {(storefront:any)=>any} wrapStorefront optional instrumentation wrapper
 */
export async function getContext(req, env, debugEnabled, wrapStorefront) {
  const customerSession = await CustomerSession.init(req, [env.SESSION_SECRET]);

  // Derive buyer IP safely (may vary in serverless environment)
  const forwardedFor = req.headers['x-forwarded-for'];
  let buyerIp = '';
  if (Array.isArray(forwardedFor)) buyerIp = forwardedFor[0];
  else if (typeof forwardedFor === 'string' && forwardedFor.length) buyerIp = forwardedFor.split(',')[0].trim();
  else buyerIp = req.socket?.remoteAddress || req.connection?.remoteAddress || '';

  const storefrontConfig = {
    cache: new InMemoryCache(),
    waitUntil: null,
    i18n: {language: 'EN', country: 'US'},
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontHeaders: {
      requestGroupId: crypto.randomUUID(),
      buyerIp,
      cookie: req.get('cookie'),
    },
  };
  let {storefront} = createStorefrontClient(storefrontConfig);
  if (debugEnabled && wrapStorefront) {
    storefront = wrapStorefront(storefront);
  }
  return {customerSession, storefront, env};
}
