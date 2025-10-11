import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, useActionData, useLoaderData } from 'react-router';
import { LinksFunction } from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import { createCustomerAccessToken } from '~/lib/shopifyCustomer.server';
import {
  getAppContext,
  setCustomerToken,
  commitSession,
} from '~/lib/session.server';
import { validateEmail, validatePassword, normalizeStorefrontErrors } from '~/lib/validation.server';
import { LoginForm } from '~/components/auth';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: homepageStyles },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/account';
  return Response.json({ redirectTo });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/account';

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
      setCustomerToken(customerSession, result.customerAccessToken.accessToken);
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
  const loaderData = useLoaderData() as { redirectTo: string };
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
          />
        </div>
      </div>
    </section>
  );
}
