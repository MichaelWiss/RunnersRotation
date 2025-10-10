import { AuthError } from './AuthError';

interface RecoverFormProps {
  errors?: Record<string, string>;
  success?: boolean;
}

export function RecoverForm({ errors, success }: RecoverFormProps) {
  return (
    <form method="post" className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      {errors && <AuthError errors={errors} />}
      {success && (
        <div
          style={{
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            color: '#363'
          }}
        >
          If an account with that email exists, we have sent a password reset link.
        </div>
      )}

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
      </div>
      <button type="submit" className="add-to-cart" style={{ width: '100%', marginTop: '16px' }}>
        Send Reset Link
      </button>
      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        <a href="/account/login">Back to Sign In</a>
      </p>
    </form>
  );
}