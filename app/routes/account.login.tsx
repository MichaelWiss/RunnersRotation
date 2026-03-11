import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, useActionData, useLoaderData } from 'react-router';
import { LinksFunction } from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import { createCustomerAccessToken } from '~/lib/shopifyCustomer.server';
import {
  getAppContext,
  setCustomerToken,
  commitSession,
  getCsrfToken,
  validateCsrfToken,
} from '~/lib/session.server';
import { validateEmail, validatePassword, normalizeStorefrontErrors } from '~/lib/validation.server';
import { LoginForm } from '~/components/auth';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: homepageStyles },
];

/** Only allow redirects to local paths (prevents open redirect attacks). */
function safeRedirectTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/account';
  return value;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = safeRedirectTo(url.searchParams.get('redirectTo'));
  const {customerSession} = getAppContext(context);
  const csrfToken = getCsrfToken(customerSession);
  const headers = await commitSession(customerSession);
  return Response.json({ redirectTo, csrfToken }, { headers });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = safeRedirectTo(formData.get('redirectTo') as string | null);

  const {customerSession, env} = getAppContext(context);

  // CSRF validation
  const csrfToken = formData.get('csrf') as string;
  if (!validateCsrfToken(customerSession, csrfToken)) {
    return Response.json({ errors: { general: 'Invalid form submission. Please reload and try again.' } }, { status: 403 });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return Response.json({ errors: { email: emailValidation.error } }, { status: 400 });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return Response.json({ errors: { password: passwordValidation.error } }, { status: 400 });
  }

  const {customerSession, env} = getAppContext(context);

  try {
    const result = await createCustomerAccessToken(email, password, env);

    if (result.customerAccessToken) {
      setCustomerToken(customerSession, result.customerAccessToken.accessToken, result.customerAccessToken.expiresAt);
      const headers = await commitSession(customerSession);
      return redirect(redirectTo, { headers });
    } else {
      const errors = normalizeStorefrontErrors(result.customerUserErrors || []);
      return Response.json({ errors: { general: errors.join(', ') } }, { status: 400 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ errors: { general: 'An unexpected error occurred. Please try again.' } }, { status: 500 });
  }
}

export default function Login() {
  const loaderData = useLoaderData() as { redirectTo: string; csrfToken: string };
  const actionData = useActionData() as { errors?: Record<string, string> } | undefined;

  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Account</div>
        <h2 className="home-products-title">Sign In</h2>
        <p className="home-products-subtitle">Enter your email and password to access your account.</p>
      </div>

      <div className="product-container">
        <div className="product-container__inner">
          <LoginForm
            errors={actionData?.errors}
            redirectTo={loaderData.redirectTo}
            csrfToken={loaderData.csrfToken}
          />
        </div>
      </div>
    </section>
  );
}
