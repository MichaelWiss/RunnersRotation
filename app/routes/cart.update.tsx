import type { ActionFunctionArgs } from 'react-router';
import { CART_UPDATE_MUTATION } from '~/lib/shopify';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lineId = String(formData.get('lineId'));
  const quantity = Number(formData.get('quantity'));
  const cartId = await context.session.get('cartId');
  
  if (!cartId || !lineId || quantity < 0) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const result = await context.storefront.mutate(CART_UPDATE_MUTATION, {
      variables: { 
        cartId, 
        lines: [{ id: lineId, quantity }] 
      }
    });
    
    if (result.cartLinesUpdate.userErrors.length > 0) {
      throw new Error(result.cartLinesUpdate.userErrors[0].message);
    }
    
    return Response.json({ 
      success: true, 
      cart: result.cartLinesUpdate.cart 
    });
    
  } catch (error) {
    console.error('Cart update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}