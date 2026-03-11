import { type ActionFunctionArgs, redirect } from 'react-router';
import { deleteCustomerAccessToken } from '~/lib/shopifyCustomer.server';
import {
  getAppContext,
  getCustomerToken,
  clearCustomerToken,
  commitSession,
  validateCsrfToken,
} from '~/lib/session.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const {customerSession, env} = getAppContext(context);

  // CSRF validation
  const formData = await request.formData();
  const csrfToken = formData.get('csrf') as string;
  if (!validateCsrfToken(customerSession, csrfToken)) {
    return Response.json({ error: 'Invalid form submission' }, { status: 403 });
  }

  const token = getCustomerToken(customerSession);
  if (token) {
    try {
      // Optionally delete the token on Shopify side
      await deleteCustomerAccessToken(token, env);
    } catch (error) {
      // Log but don't fail the logout
      console.error('Error deleting customer access token:', error);
    }
  }

  clearCustomerToken(customerSession);
  const headers = await commitSession(customerSession);
  return redirect('/', { headers });
}

// This route doesn't render anything, just handles the action
export default function Logout() {
  return null;
}
