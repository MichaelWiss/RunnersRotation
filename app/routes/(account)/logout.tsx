import { type ActionFunctionArgs, redirect } from 'react-router';
import { deleteCustomerAccessToken } from '~/lib/shopifyCustomer.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const ctx = context as unknown as { customerSession: any; env: Record<string, string | undefined> };

  const token = ctx.customerSession.getCustomerToken();
  if (token) {
    try {
      // Optionally delete the token on Shopify side
      await deleteCustomerAccessToken(token, ctx.env);
    } catch (error) {
      // Log but don't fail the logout
      console.error('Error deleting customer access token:', error);
    }
  }

  ctx.customerSession.clearCustomerToken();
  const [, headers] = ctx.customerSession.commitWithHeaders();
  return redirect('/', { headers });
}

// This route doesn't render anything, just handles the action
export default function Logout() {
  return null;
}