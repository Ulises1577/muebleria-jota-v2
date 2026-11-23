import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { formatCurrency } from '../utils/format';
import { getProductId, getStockStatus } from '../utils/inventory';
import { Badge, Button } from './ui';
import { useAuth } from '../context/AuthContext';
import { useAddToCart } from '../context/CartContext';

/**
 * Tarjeta de producto única para catálogo, destacados y relacionados.
 * Lee sesión y carrito desde Context: clientes ven "Agregar", administradores ven stock y "Editar".
 */
export function ProductCard({ product, compact = false }) {
  const { isAdmin } = useAuth();
  const addToCart = useAddToCart();
  const id = getProductId(product);
  const status = getStockStatus(product);
  const soldOut = status.key === 'out';

  return (
    <article className={`product-card ${compact ? 'product-card--compact' : ''}`}>
      <div className="product-card__media">
        {product.imagenUrl && <img src={product.imagenUrl} alt="" loading="lazy" />}
        {(soldOut || isAdmin) && (
          <span className="product-card__badge">
            <Badge tone={status.tone}>{isAdmin && !soldOut ? `${product.stock} en stock` : status.label}</Badge>
          </span>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.categoria}</span>
        <h3 className="product-card__title">
          <Link to={ROUTES.product(id)}>{product.nombre}</Link>
        </h3>
        {!compact && <p className="product-card__text">{product.descripcion}</p>}
        <div className="product-card__footer">
          <span className="product-card__price">{formatCurrency(product.precio)}</span>
          {isAdmin ? (
            <Link to={ROUTES.admin} state={{ editProductId: id }} className="btn btn--outline btn--sm product-card__cta">
              <span>Editar</span>
            </Link>
          ) : (
            <Button
                variant="outline"
                size="sm"
                icon="plus"
                className="product-card__cta"
                disabled={soldOut}
                onClick={() => addToCart(product)}
                aria-label={soldOut ? `${product.nombre} sin stock` : `Agregar ${product.nombre} al carrito`}
              >
                {soldOut ? 'Agotado' : 'Agregar'}
              </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden="true">
      <span className="skeleton" style={{ aspectRatio: '4 / 3.4', borderRadius: 0 }} />
      <div className="product-card__body">
        <span className="skeleton" style={{ height: 10, width: '35%' }} />
        <span className="skeleton" style={{ height: 18, width: '70%' }} />
        <span className="skeleton" style={{ height: 12, width: '90%' }} />
        <span className="skeleton" style={{ height: 16, width: '40%' }} />
      </div>
    </div>
  );
}
