import { type ActionFunctionArgs, useActionData } from 'react-router';
import { LinksFunction } from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import { recoverCustomer } from '~/lib/shopifyCustomer.server';
import { validateEmail, normalizeStorefrontErrors } from '~/lib/validation.server';
import { RecoverForm } from '~/components/auth';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: homepageStyles },
];

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return Response.json({ errors: { email: emailValidation.error } }, { status: 400 });
  }

  const ctx = context as unknown as { env: Record<string, string | undefined> };

  try {
    const result = await recoverCustomer(email, ctx.env);

    if (result.customerUserErrors && result.customerUserErrors.length > 0) {
      const errors = normalizeStorefrontErrors(result.customerUserErrors);
      return Response.json({ errors: { general: errors.join(', ') } }, { status: 400 });
    } else {
      return Response.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link.' });
    }
  } catch (error) {
    console.error('Password recovery error:', error);
    return Response.json({ errors: { general: 'An unexpected error occurred. Please try again.' } }, { status: 500 });
  }
}

export default function Recover() {
  const actionData = useActionData() as { errors?: Record<string, string>; success?: boolean } | undefined;

  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Account</div>
        <h2 className="home-products-title">Reset Password</h2>
        <p className="home-products-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <div className="product-container">
        <div className="product-container__inner">
          <RecoverForm
            errors={actionData?.errors}
            success={actionData?.success}
          />
        </div>
      </div>
    </section>
  );
}