import { type ActionFunctionArgs, redirect } from 'react-router';
import { deleteCustomerAccessToken } from '~/lib/shopifyCustomer.server';
import {
  getAppContext,
  getCustomerToken,
  clearCustomerToken,
  commitSession,
  requireCsrf,
} from '~/lib/session.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const {customerSession} = getAppContext(context);

  const formData = await request.formData();
  requireCsrf(customerSession, formData);

  const token = getCustomerToken(customerSession);
  if (token) {
    try {
      // Optionally delete the token on Shopify side
      await deleteCustomerAccessToken(token, context.storefront);
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
