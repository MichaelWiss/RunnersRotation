import { AuthError } from './AuthError';

interface RegisterFormProps {
  errors?: Record<string, string>;
}

export function RegisterForm({ errors }: RegisterFormProps) {
  return (
    <form method="post" className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      {errors && <AuthError errors={errors} />}

      <div className="selectors">
        <div className="select">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            placeholder="Your first name"
            className="pill"
            style={{ width: '100%', padding: '12px' }}
          />
        </div>
        <div className="select">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            placeholder="Your last name"
            className="pill"
            style={{ width: '100%', padding: '12px' }}
          />
        </div>
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
            placeholder="Create a password (min 8 characters)"
            className="pill"
            style={{ width: '100%', padding: '12px' }}
          />
        </div>
      </div>
      <button type="submit" className="add-to-cart" style={{ width: '100%', marginTop: '16px' }}>
        Create Account
      </button>
      <p style={{ textAlign: 'center', marginTop: '16px' }}>
        <a href="/account/login">Already have an account? Sign in</a>
      </p>
    </form>
  );
}