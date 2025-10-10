import { AuthError } from './AuthError';

interface LoginFormProps {
  errors?: Record<string, string>;
  redirectTo?: string;
}

export function LoginForm({ errors, redirectTo }: LoginFormProps) {
  return (
    <form method="post" className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      {errors && <AuthError errors={errors} />}
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      <div className="selectors">
        <div className="select">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="pill"
            style={{ width: '100%', padding: '12px' }}
          />
        </div>
        <div className="select">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Your password"
            className="pill"
            style={{ width: '100%', padding: '12px' }}
          />
        </div>
      </div>
      <button type="submit" className="add-to-cart" style={{ width: '100%', marginTop: '16px' }}>
        Sign In
      </button>
      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        <a href="/account/register">Don't have an account? Sign up</a>
      </p>
      <p style={{ textAlign: 'center', marginTop: '8px' }}>
        <a href="/account/recover">Forgot your password?</a>
      </p>
    </form>
  );
}