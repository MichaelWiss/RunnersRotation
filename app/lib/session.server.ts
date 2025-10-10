import { AppSession } from '../../context.mjs';

/**
 * Session helpers for customer authentication.
 * Wraps the AppSession class with customer-specific methods.
 */
export class CustomerSession {
  constructor(private session: AppSession) {}

  static async init(request: Request, secrets: string[]) {
    const appSession = await AppSession.init(request, secrets);
    return new this(appSession);
  }

  getCustomerToken(): string | undefined {
    return this.session.get('customerAccessToken') as string | undefined;
  }

  setCustomerToken(token: string) {
    this.session.set('customerAccessToken', token);
  }

  clearCustomerToken() {
    this.session.unset('customerAccessToken');
  }

  commitWithHeaders(): [string, Headers] {
    const cookie = this.session.commit();
    const headers = new Headers();
    headers.set('Set-Cookie', cookie);
    return [cookie, headers];
  }

  destroy() {
    return this.session.destroy();
  }
}