import type { ActionFunctionArgs } from 'react-router';
import { CART_CREATE_MUTATION, CART_ADD_MUTATION } from '~/lib/shopify';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const variantId = String(formData.get('variantId'));
  const quantity = Number(formData.get('quantity') || 1);
  
  if (!variantId) {
    return Response.json({ error: 'Variant ID required' }, { status: 400 });
  }

  let cartId = await context.session.get('cartId');
  
  try {
    // Create cart if doesn't exist
    if (!cartId) {
      const createResult = await context.storefront.mutate(CART_CREATE_MUTATION, {
        variables: {
          input: {
            lines: [{ merchandiseId: variantId, quantity }]
          }
        }
      });
      
      if (createResult.cartCreate.userErrors.length > 0) {
        throw new Error(createResult.cartCreate.userErrors[0].message);
      }
      
      cartId = createResult.cartCreate.cart.id;
      context.session.set('cartId', cartId);
      
      return Response.json({ 
        success: true, 
        cart: createResult.cartCreate.cart 
      });
    }
    
    // Add to existing cart
    const addResult = await context.storefront.mutate(CART_ADD_MUTATION, {
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }]
      }
    });
    
    if (addResult.cartLinesAdd.userErrors.length > 0) {
      throw new Error(addResult.cartLinesAdd.userErrors[0].message);
    }
    
    return Response.json({ 
      success: true, 
      cart: addResult.cartLinesAdd.cart 
    });
    
  } catch (error) {
    console.error('Cart add error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}