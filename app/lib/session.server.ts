import {CustomerSession} from '../../context.mjs';

export {CustomerSession};

export type AppLoadContext = {
  customerSession: CustomerSession;
  env: Record<string, string | undefined>;
};

function assertAppContext(context: unknown): AppLoadContext {
  if (!context || typeof context !== 'object' || context === null) {
    throw new Error('App load context is unavailable.');
  }

  const maybeContext = context as Partial<AppLoadContext>;

  if (!(maybeContext.customerSession instanceof CustomerSession)) {
    throw new Error('Expected customerSession to be present on the load context.');
  }

  if (!maybeContext.env) {
    throw new Error('Expected env to be present on the load context.');
  }

  return maybeContext as AppLoadContext;
}

export function getAppContext(context: unknown): AppLoadContext {
  return assertAppContext(context);
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
