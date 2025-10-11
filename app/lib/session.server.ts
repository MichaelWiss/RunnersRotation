import {CustomerSession} from '../../context.mjs';

export {CustomerSession};

export type AppLoadContext = {
  customerSession: CustomerSession;
  env: Record<string, string | undefined>;
};

type MaybeContext = {
  customerSession?: unknown;
  env?: Record<string, string | undefined>;
};

function isCustomerSession(value: unknown): value is CustomerSession {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as CustomerSession).getCustomerToken === 'function' &&
    typeof (value as CustomerSession).get === 'function' &&
    typeof (value as CustomerSession).commitHeaders === 'function' &&
    typeof (value as CustomerSession).destroyHeaders === 'function'
  );
}

function createNoopSession(): CustomerSession {
  const noop = {
    getCustomerToken: () => undefined,
    setCustomerToken: () => {},
    clearCustomerToken: () => {},
    get: () => undefined,
    set: () => {},
    commit: async () => '',
    commitHeaders: async () => new Headers(),
    destroy: async () => '',
    destroyHeaders: async () => new Headers(),
  };
  return noop as unknown as CustomerSession;
}

export function getAppContext(context: unknown): AppLoadContext {
  if (context && typeof context === 'object') {
    const maybe = context as MaybeContext;
    const env = maybe.env ?? {};
    const session = isCustomerSession(maybe.customerSession)
      ? (maybe.customerSession as CustomerSession)
      : createNoopSession();
    return {customerSession: session, env};
  }

  return {
    customerSession: createNoopSession(),
    env: {},
  };
}

export function getCustomerSession(context: unknown): CustomerSession {
  return getAppContext(context).customerSession;
}

export function getEnv(context: unknown): Record<string, string | undefined> {
  return getAppContext(context).env;
}

export function getCustomerToken(session: CustomerSession) {
  return session.getCustomerToken();
}

export function setCustomerToken(session: CustomerSession, token: string) {
  session.setCustomerToken(token);
}

export function clearCustomerToken(session: CustomerSession) {
  session.clearCustomerToken();
}

export async function commitSession(session: CustomerSession): Promise<Headers> {
  return session.commitHeaders();
}

export async function destroySession(session: CustomerSession): Promise<Headers> {
  return session.destroyHeaders();
}
