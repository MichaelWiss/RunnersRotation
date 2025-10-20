import type {ActionFunctionArgs} from 'react-router';
import {CART_CREATE_MUTATION, CART_ADD_MUTATION} from '~/lib/shopify';
import {getAppContext, commitSession} from '~/lib/session.server';

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const variantId = String(formData.get('variantId') || '');
  const requestedQuantity = Number(formData.get('quantity'));
  const quantity = Number.isFinite(requestedQuantity)
    ? Math.max(1, Math.floor(requestedQuantity))
    : 1;

  if (!variantId) {
    return Response.json({error: 'Variant ID required'}, {status: 400});
  }

  const {customerSession} = getAppContext(context);
  const storefront = context.storefront;

  if (!storefront) {
    return Response.json({error: 'Storefront client unavailable'}, {status: 500});
  }

  const headers = new Headers();
  let hasSessionHeaders = false;
  const mergeSessionHeaders = async () => {
    const sessionHeaders = await commitSession(customerSession);
    sessionHeaders.forEach((value, key) => {
      headers.append(key, value);
      hasSessionHeaders = true;
    });
  };
  const respond = (body: Record<string, unknown>, status = 200) => {
    const init: ResponseInit = {status};
    if (hasSessionHeaders) init.headers = headers;
    return Response.json(body, init);
  };

  const lines = [{merchandiseId: variantId, quantity}];
  const createCartWithLines = async () => {
    const createResult = await storefront.mutate(CART_CREATE_MUTATION, {
      variables: {input: {lines}},
    });
    type CartUserError = {message?: string | null} | null | undefined;
    const userErrors: CartUserError[] = createResult.cartCreate?.userErrors ?? [];
    if (userErrors.length > 0) {
      const message =
        userErrors
          .map((userError) => userError?.message)
          .filter((msg): msg is string => Boolean(msg))
          .join('; ') ||
        'Unable to create cart.';
      throw new Error(message);
    }
    const cart = createResult.cartCreate?.cart;
    if (!cart?.id) {
      throw new Error('Cart create did not return a cart.');
    }
    customerSession.set('cartId', cart.id);
    await mergeSessionHeaders();
    return cart;
  };

  let cartId = customerSession.get('cartId') as string | undefined;

  try {
    if (!cartId) {
      const cart = await createCartWithLines();
      return respond({success: true, cart});
    }

    const addResult = await storefront.mutate(CART_ADD_MUTATION, {
      variables: {cartId, lines},
    });

    const addErrors = addResult.cartLinesAdd?.userErrors ?? [];
    if (addErrors.length > 0) {
      console.warn('[cart.add] cartLinesAdd user errors', addErrors);
      const cart = await createCartWithLines();
      return respond({success: true, cart, replacedCart: true});
    }

    const cart = addResult.cartLinesAdd?.cart;
    if (!cart?.id) {
      console.warn('[cart.add] cartLinesAdd returned no cart; rebuilding session cart');
      const rebuiltCart = await createCartWithLines();
      return respond({success: true, cart: rebuiltCart, replacedCart: true});
    }

    return respond({success: true, cart});
  } catch (error) {
    console.error('Cart add error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return respond({error: errorMessage}, 500);
  }
}
