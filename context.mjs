import {createCookieSessionStorage} from 'react-router';
import {createStorefrontClient, InMemoryCache} from '@shopify/hydrogen';
import crypto from 'node:crypto';
import { CustomerSession } from './app/lib/session.server.js';

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
