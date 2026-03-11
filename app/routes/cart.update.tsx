import type {ActionFunctionArgs} from 'react-router';
import {CART_UPDATE_MUTATION} from '~/lib/shopify';
import {getAppContext, requireCsrf} from '~/lib/session.server';

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const {customerSession} = getAppContext(context);
  requireCsrf(customerSession, formData);

  const lineId = String(formData.get('lineId') || '');
  const quantity = Number(formData.get('quantity'));
  const storefront = context.storefront;
  const cartId = customerSession.get('cartId') as string | undefined;

  if (!cartId || !lineId || quantity < 0) {
    return Response.json({error: 'Invalid parameters'}, {status: 400});
  }

  if (!storefront) {
    return Response.json({error: 'Storefront client unavailable'}, {status: 500});
  }

  try {
    const result = await storefront.mutate(CART_UPDATE_MUTATION, {
      variables: { 
        cartId, 
        lines: [{id: lineId, quantity}],
      },
    });
    
    if (result.cartLinesUpdate.userErrors.length > 0) {
      throw new Error(result.cartLinesUpdate.userErrors[0].message);
    }
    
    return Response.json({
      success: true,
      cart: result.cartLinesUpdate.cart,
    });
    
  } catch (error) {
    console.error('Cart update error:', error);
    return Response.json({error: 'Unable to update cart'}, {status: 500});
  }
}
