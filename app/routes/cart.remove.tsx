import type { ActionFunctionArgs } from 'react-router';
import { CART_REMOVE_MUTATION } from '~/lib/shopify';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const lineId = String(formData.get('lineId'));
  const cartId = await context.session.get('cartId');
  
  if (!cartId || !lineId) {
    return Response.json({ error: 'Cart ID and line ID required' }, { status: 400 });
  }

  try {
    const result = await context.storefront.mutate(CART_REMOVE_MUTATION, {
      variables: { cartId, lineIds: [lineId] }
    });
    
    if (result.cartLinesRemove.userErrors.length > 0) {
      throw new Error(result.cartLinesRemove.userErrors[0].message);
    }
    
    return Response.json({ 
      success: true, 
      cart: result.cartLinesRemove.cart 
    });
    
  } catch (error) {
    console.error('Cart remove error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}