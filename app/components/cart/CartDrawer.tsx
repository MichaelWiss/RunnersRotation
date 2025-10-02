import { useCart } from '~/context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartLine } = useCart();

  const formatMoney = (amount: string | number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(typeof amount === 'string' ? Number(amount) : amount);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="cart-backdrop" 
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 37, 69, 0.5)',
          zIndex: 9999,
        }}
      />
      
      {/* Drawer */}
      <div 
        className="cart-drawer"
        style={{
          position: 'fixed',
          top: 'var(--announcement-h, 40px)',
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '100vw',
          backgroundColor: 'var(--card)',
          zIndex: 10000,
          boxShadow: 'var(--shadow-strong)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '0px',
          border: '1px solid var(--line)',
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--card)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h2 style={{ 
              margin: 0, 
              color: 'var(--panel)',
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px'
            }}>
              Cart ({cart?.totalQuantity || 0})
            </h2>
            <button 
              onClick={onClose} 
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '24px', 
                cursor: 'pointer',
                color: 'var(--panel)',
                padding: '5px'
              }}
              aria-label="Close cart"
            >
              ×
            </button>
          </div>
        </div>

        {/* Cart Lines */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '20px',
          backgroundColor: 'var(--card)'
        }}>
          {!cart || cart.lines.edges.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '40px' }}>
              Your cart is empty
            </p>
          ) : (
            cart.lines.edges.map(({ node: line }) => (
              <div 
                key={line.id} 
                style={{ 
                  marginBottom: '20px', 
                  paddingBottom: '20px', 
                  borderBottom: '1px solid var(--line)' 
                }}
              >
                <div style={{ display: 'flex', gap: '15px' }}>
                  {line.merchandise.image && (
                    <img 
                      src={line.merchandise.image.url} 
                      alt={line.merchandise.image.altText || ''} 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 5px 0',
                      color: 'var(--panel)',
                      fontSize: '16px'
                    }}>
                      {line.merchandise.product.title}
                    </h4>
                    <p style={{ 
                      margin: '0 0 10px 0', 
                      color: 'var(--muted)',
                      fontSize: '14px'
                    }}>
                      {line.merchandise.title}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                          onClick={() => updateCartLine(line.id, line.quantity - 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: '1px solid var(--line)',
                            background: 'var(--card)',
                            color: 'var(--panel)',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ 
                          minWidth: '20px', 
                          textAlign: 'center',
                          color: 'var(--panel)'
                        }}>
                          {line.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartLine(line.id, line.quantity + 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: '1px solid var(--line)',
                            background: 'var(--card)',
                            color: 'var(--panel)',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--panel)', fontWeight: 'bold' }}>
                          {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </div>
                        <button 
                          onClick={() => removeFromCart(line.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--accent)', 
                            cursor: 'pointer',
                            fontSize: '12px',
                            textDecoration: 'underline'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart && cart.lines.edges.length > 0 && (
          <div style={{ 
            padding: '20px', 
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--card)'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--panel)'
              }}>
                <span>Total:</span>
                <span>
                  {formatMoney(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                </span>
              </div>
            </div>
            <a 
              href={cart.checkoutUrl} 
              style={{
                display: 'block',
                width: '100%',
                padding: '15px',
                backgroundColor: 'var(--accent)',
                color: 'var(--card)',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
