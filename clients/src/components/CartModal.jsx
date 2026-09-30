import React from 'react';

export const CartModal = ({ isOpen, onClose, cart = [], onUpdateQuantity, onRemoveItem, onClearCart }) => {
  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

  const formattedTotal = total.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="cart-modal-header">
          <div>
            <h3 style={{ margin: 0, color: 'var(--siena-tostado)' }}>Tu Carrito</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {cart.length === 0 ? 'Sin artículos' : `${cart.reduce((a, b) => a + b.quantity, 0)} productos`}
            </span>
          </div>
          <button 
            type="button"
            className="cart-modal-close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Lista de productos */}
        <div className="cart-modal-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🛋️</span>
              <p style={{ color: 'var(--color-text-secondary)' }}>Tu carrito está vacío.</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = (item.precio * item.quantity).toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0
              });

              return (
                <div key={item.id} className="cart-modal-item">
                  <img src={item.imagen} alt={item.nombre} className="cart-modal-item-img" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{item.nombre}</h4>
                    <span style={{ color: 'var(--siena-tostado)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {itemTotal}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ width: '24px', height: '24px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ width: '24px', height: '24px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px' }}
                      >
                        +
                      </button>
                      <button 
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '0.75rem', marginLeft: 'auto', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total y acciones */}
        {cart.length > 0 && (
          <div className="cart-modal-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700 }}>
              <span>Total Estimado:</span>
              <span style={{ color: 'var(--siena-tostado)' }}>{formattedTotal}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                className="btn-detalle"
                style={{ flex: 1, background: '#6e6259', padding: '0.6rem' }}
                onClick={onClearCart}
              >
                Vaciar
              </button>
              <button 
                type="button"
                className="btn-detalle"
                style={{ flex: 2, padding: '0.6rem' }}
                onClick={() => alert(`¡Gracias por tu compra! Procesando pedido por ${formattedTotal}`)}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
