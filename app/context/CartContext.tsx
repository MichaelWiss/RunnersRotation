import {createContext, useContext, useReducer, useEffect} from 'react';
import {useFetcher} from 'react-router';
import type {Cart} from '@shopify/hydrogen/storefront-api-types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'SET_CART'; cart: Cart | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return {...state, cart: action.cart, error: null};
    case 'SET_LOADING':
      return {...state, isLoading: action.loading};
    case 'SET_ERROR':
      return {...state, error: action.error};
    default:
      return state;
  }
}

interface CartContextValue extends CartState {
  addToCart: (variantId: string, quantity?: number) => void;
  removeFromCart: (lineId: string) => void;
  updateCartLine: (lineId: string, quantity: number) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ 
  children, 
  initialCart 
}: { 
  children: React.ReactNode; 
  initialCart: Cart | null;
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: initialCart,
    isLoading: false,
    error: null,
  });

  const addFetcher = useFetcher();
  const removeFetcher = useFetcher();
  const updateFetcher = useFetcher();

  // Update cart when fetchers complete
  useEffect(() => {
    if (addFetcher.data?.cart) {
      dispatch({ type: 'SET_CART', cart: addFetcher.data.cart });
    }
    if (addFetcher.data?.error) {
      dispatch({ type: 'SET_ERROR', error: addFetcher.data.error });
    }
    dispatch({ type: 'SET_LOADING', loading: addFetcher.state === 'submitting' });
  }, [addFetcher.data, addFetcher.state]);

  useEffect(() => {
    if (removeFetcher.data?.cart) {
      dispatch({ type: 'SET_CART', cart: removeFetcher.data.cart });
    }
    if (removeFetcher.data?.error) {
      dispatch({ type: 'SET_ERROR', error: removeFetcher.data.error });
    }
  }, [removeFetcher.data]);

  useEffect(() => {
    if (updateFetcher.data?.cart) {
      dispatch({ type: 'SET_CART', cart: updateFetcher.data.cart });
    }
    if (updateFetcher.data?.error) {
      dispatch({ type: 'SET_ERROR', error: updateFetcher.data.error });
    }
  }, [updateFetcher.data]);

  const addToCart = (variantId: string, quantity = 1) => {
    dispatch({type: 'SET_ERROR', error: null});
    dispatch({ type: 'SET_LOADING', loading: true });
    addFetcher.submit(
      { variantId, quantity: quantity.toString() },
      { method: 'post', action: '/cart/add' }
    );
  };

  const removeFromCart = (lineId: string) => {
    dispatch({type: 'SET_ERROR', error: null});
    removeFetcher.submit(
      { lineId },
      { method: 'post', action: '/cart/remove' }
    );
  };

  const updateCartLine = (lineId: string, quantity: number) => {
    dispatch({type: 'SET_ERROR', error: null});
    updateFetcher.submit(
      { lineId, quantity: quantity.toString() },
      { method: 'post', action: '/cart/update' }
    );
  };

  const cartCount = state.cart?.totalQuantity || 0;

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateCartLine,
      cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
