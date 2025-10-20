import type {ActionFunctionArgs} from 'react-router';
import {CART_REMOVE_MUTATION} from '~/lib/shopify';
import {getAppContext} from '~/lib/session.server';

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const lineId = String(formData.get('lineId') || '');
  const {customerSession} = getAppContext(context);
  const storefront = context.storefront;
  const cartId = customerSession.get('cartId') as string | undefined;
  
  if (!cartId || !lineId) {
    return Response.json({error: 'Cart ID and line ID required'}, {status: 400});
  }

  if (!storefront) {
    return Response.json({error: 'Storefront client unavailable'}, {status: 500});
  }

  try {
    const result = await storefront.mutate(CART_REMOVE_MUTATION, {
      variables: {cartId, lineIds: [lineId]},
    });
    
    if (result.cartLinesRemove.userErrors.length > 0) {
      throw new Error(result.cartLinesRemove.userErrors[0].message);
    }
    
    return Response.json({
      success: true,
      cart: result.cartLinesRemove.cart,
    });
    
  } catch (error) {
    console.error('Cart remove error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({error: errorMessage}, {status: 500});
  }
}
