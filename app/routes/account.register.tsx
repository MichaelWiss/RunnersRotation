import { type ActionFunctionArgs, redirect, useActionData } from 'react-router';
import { LinksFunction } from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import { createCustomer, createCustomerAccessToken } from '~/lib/shopifyCustomer.server';
import { validateEmail, validatePassword, normalizeStorefrontErrors } from '~/lib/validation.server';
import { RegisterForm } from '~/components/auth';
import {
  getAppContext,
  setCustomerToken,
  commitSession,
} from '~/lib/session.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: homepageStyles },
];

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

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
    const createResult = await createCustomer(env, email, password, firstName, lastName);

    if (createResult.customer) {
      // Auto-login after successful registration
      const loginResult = await createCustomerAccessToken(email, password, env);

      if (loginResult.customerAccessToken) {
        setCustomerToken(customerSession, loginResult.customerAccessToken.accessToken);
        const headers = await commitSession(customerSession);
        return redirect('/account', { headers });
      } else {
        // Registration succeeded but login failed - redirect to login
        return redirect('/account/login?message=Registration successful, please sign in');
      }
    } else {
      const errors = normalizeStorefrontErrors(createResult.customerUserErrors || []);
      return Response.json({ errors: { general: errors.join(', ') } }, { status: 400 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ errors: { general: 'An unexpected error occurred. Please try again.' } }, { status: 500 });
  }
}

export default function Register() {
  const actionData = useActionData() as { errors?: Record<string, string> } | undefined;

  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Account</div>
        <h2 className="home-products-title">Create Account</h2>
        <p className="home-products-subtitle">Join Velocity Running to access your personalized experience.</p>
      </div>

      <div className="product-container">
        <div className="product-container__inner">
          <RegisterForm errors={actionData?.errors} />
        </div>
      </div>
    </section>
  );
}
