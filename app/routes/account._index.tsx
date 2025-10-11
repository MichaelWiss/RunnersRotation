import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router';
import {LinksFunction} from 'react-router';
import homepageStyles from '~/styles/homepage.css?url';
import {AuthError} from '~/components/auth/AuthError';
import {
  getAppContext,
  getCustomerToken,
  clearCustomerToken,
  commitSession,
} from '~/lib/session.server';
import {
  getCustomer,
  updateCustomer,
  createCustomerAccessToken,
  deleteCustomerAccessToken,
} from '~/lib/shopifyCustomer.server';
import {
  validateEmail,
  validatePassword,
  normalizeStorefrontErrors,
} from '~/lib/validation.server';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: homepageStyles},
];

type LoaderData = {
  customer: {
    id: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    orders: Array<{
      id: string;
      orderNumber: number | string;
      totalPrice: string;
      processedAt: string;
    }>;
  };
};

type ActionData = {
  profile?: {
    errors?: Record<string, string>;
    success?: string;
  };
  password?: {
    errors?: Record<string, string>;
    success?: string;
  };
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const {customerSession, env} = getAppContext(context);
  const token = getCustomerToken(customerSession);
  const redirectTarget = `/account/login?redirectTo=${encodeURIComponent(new URL(request.url).pathname)}`;

  if (!token) {
    throw redirect(redirectTarget);
  }

  try {
    const customer = await getCustomer(token, env);

    if (!customer) {
      clearCustomerToken(customerSession);
      const headers = await commitSession(customerSession);
      throw redirect(redirectTarget, {headers});
    }

    const orders = (customer.orders?.edges ?? []).map(({node}: any) => ({
      id: node.id,
      orderNumber: node.orderNumber,
      totalPrice: `${node.totalPrice.amount} ${node.totalPrice.currencyCode}`,
      processedAt: node.processedAt,
    }));

    return Response.json({
      customer: {
        id: customer.id,
        displayName: customer.displayName ?? null,
        firstName: customer.firstName ?? null,
        lastName: customer.lastName ?? null,
        email: customer.email ?? null,
        orders,
      },
    } satisfies LoaderData);
  } catch (error) {
    console.error('Account loader error:', error);
    clearCustomerToken(customerSession);
    const headers = await commitSession(customerSession);
    throw redirect(redirectTarget, {headers});
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerSession, env} = getAppContext(context);
  const token = getCustomerToken(customerSession);

  if (!token) {
    return redirect('/account/login?redirectTo=/account');
  }

  const formData = await request.formData();
  const intent = typeof formData.get('intent') === 'string' ? (formData.get('intent') as string) : '';

  if (intent === 'update-profile') {
    const firstName = typeof formData.get('firstName') === 'string' ? (formData.get('firstName') as string).trim() : '';
    const lastName = typeof formData.get('lastName') === 'string' ? (formData.get('lastName') as string).trim() : '';
    const email = typeof formData.get('email') === 'string' ? (formData.get('email') as string).trim() : '';

    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else {
      const validation = validateEmail(email);
      if (!validation.isValid && validation.error) {
        errors.email = validation.error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({profile: {errors}}, {status: 400});
    }

    try {
      const result = await updateCustomer(token, {firstName, lastName, email}, env);
      const userErrors = result?.customerUserErrors ?? [];
      if (userErrors.length) {
        const messages = normalizeStorefrontErrors(userErrors);
        return Response.json({profile: {errors: {general: messages.join(', ') || 'Unable to update profile'}}}, {status: 400});
      }

      return Response.json({profile: {success: 'Profile updated successfully'}} satisfies ActionData);
    } catch (error) {
      console.error('Account profile update error:', error);
      return Response.json({profile: {errors: {general: 'Unable to update profile right now. Please try again.'}}}, {status: 500});
    }
  }

  if (intent === 'change-password') {
    const currentEmail = typeof formData.get('currentEmail') === 'string' ? (formData.get('currentEmail') as string).trim() : '';
    const currentPassword = typeof formData.get('currentPassword') === 'string' ? (formData.get('currentPassword') as string) : '';
    const newPassword = typeof formData.get('newPassword') === 'string' ? (formData.get('newPassword') as string) : '';
    const confirmPassword = typeof formData.get('confirmPassword') === 'string' ? (formData.get('confirmPassword') as string) : '';

    const errors: Record<string, string> = {};

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid && validation.error) {
        errors.newPassword = validation.error;
      }
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!currentEmail) {
      errors.general = 'Unable to verify account email for password change';
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({password: {errors}}, {status: 400});
    }

    try {
      const verification = await createCustomerAccessToken(currentEmail, currentPassword, env);

      if (!verification?.customerAccessToken) {
        const messages = normalizeStorefrontErrors(verification?.customerUserErrors || []);
        return Response.json({password: {errors: {currentPassword: messages[0] || 'Invalid current password'}}}, {status: 400});
      }

      const tempToken = verification.customerAccessToken.accessToken;
      try {
        await deleteCustomerAccessToken(tempToken, env);
      } catch (tokenError) {
        console.warn('Failed to discard verification token', tokenError);
      }

      const result = await updateCustomer(token, {password: newPassword}, env);
      const userErrors = result?.customerUserErrors ?? [];
      if (userErrors.length) {
        const messages = normalizeStorefrontErrors(userErrors);
        return Response.json({password: {errors: {general: messages.join(', ') || 'Unable to update password'}}}, {status: 400});
      }

      return Response.json({password: {success: 'Password updated successfully'}} satisfies ActionData);
    } catch (error) {
      console.error('Account password update error:', error);
      return Response.json({password: {errors: {general: 'Unable to update password right now. Please try again.'}}}, {status: 500});
    }
  }

  return Response.json({profile: {errors: {general: 'Unsupported action'}}}, {status: 400});
}

function SuccessMessage({children}: {children: string}) {
  return (
    <div
      style={{
        backgroundColor: '#eef9f0',
        border: '1px solid #b6e3c5',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
        color: '#20603d',
      }}
    >
      {children}
    </div>
  );
}

export default function Account() {
  const {customer} = useLoaderData<typeof loader>() as LoaderData;
  const actionData = useActionData<ActionData>() ?? {};

  const profileErrors = actionData.profile?.errors;
  const profileSuccess = actionData.profile?.success;
  const passwordErrors = actionData.password?.errors;
  const passwordSuccess = actionData.password?.success;

  return (
    <section className="section">
      <div className="home-products-header">
        <div className="home-products-kicker">Account</div>
        <h2 className="home-products-title">Welcome back{customer.displayName ? `, ${customer.displayName}` : ''}</h2>
        <p className="home-products-subtitle">Manage your profile details and keep your password secure.</p>
      </div>

      <div className="product-container" style={{paddingBottom: '48px'}}>
        <div className="product-container__inner" style={{display: 'grid', gap: '32px', maxWidth: '960px', margin: '0 auto'}}>
          <div className="card" style={{padding: '32px'}}>
            <h3 style={{marginTop: 0}}>Profile details</h3>
            {profileSuccess ? <SuccessMessage>{profileSuccess}</SuccessMessage> : null}
            {profileErrors ? <AuthError errors={profileErrors} /> : null}
            <form method="post">
              <input type="hidden" name="intent" value="update-profile" />
              <div className="selectors">
                <div className="select">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={customer.firstName ?? ''}
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
                <div className="select">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    defaultValue={customer.lastName ?? ''}
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
                <div className="select">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={customer.email ?? ''}
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
              </div>
              <button type="submit" className="add-to-cart" style={{marginTop: '20px'}}>
                Save profile
              </button>
            </form>
          </div>

          <div className="card" style={{padding: '32px'}}>
            <h3 style={{marginTop: 0}}>Password</h3>
            {passwordSuccess ? <SuccessMessage>{passwordSuccess}</SuccessMessage> : null}
            {passwordErrors ? <AuthError errors={passwordErrors} /> : null}
            <form method="post">
              <input type="hidden" name="intent" value="change-password" />
              <input type="hidden" name="currentEmail" value={customer.email ?? ''} />
              <div className="selectors">
                <div className="select">
                  <label htmlFor="currentPassword">Current password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
                <div className="select">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
                <div className="select">
                  <label htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="pill"
                    style={{width: '100%', padding: '12px'}}
                  />
                </div>
              </div>
              <button type="submit" className="add-to-cart" style={{marginTop: '20px'}}>
                Update password
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="product-container" style={{paddingTop: 0}}>
        <div className="product-container__inner" style={{maxWidth: '960px', margin: '0 auto'}}>
          <div className="card" style={{padding: '32px'}}>
            <h3 style={{marginTop: 0}}>Recent orders</h3>
            {customer.orders.length === 0 ? (
              <p style={{marginBottom: 0}}>Once you place an order, it will appear here.</p>
            ) : (
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {customer.orders.map((order) => (
                  <li key={order.id} style={{padding: '12px 0', borderBottom: '1px solid var(--line)'}}>
                    <div style={{fontWeight: 700}}>Order #{order.orderNumber}</div>
                    <div style={{fontSize: '14px', color: 'var(--muted)'}}>
                      Placed on {new Date(order.processedAt).toLocaleDateString()} · Total {order.totalPrice}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
