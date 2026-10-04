import React from 'react';

export const ProductCard = ({ product, onSelectProduct }) => {
  const precioFormateado = product.precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  return (
    <article className="tarjeta-producto">
      <div
        className="producto-media"
        onClick={() => onSelectProduct(product.id)}
      >
        <img
          src={product.imagen}
          alt={product.nombre}
          className="producto-imagen"
          loading="lazy"
        />
      </div>
      <div className="producto-info">
        {product.categoria && (
          <span className="producto-categoria">{product.categoria}</span>
        )}
        <h3 onClick={() => onSelectProduct(product.id)}>
          {product.nombre}
        </h3>
        <p className="producto-descripcion">{product.descripcion}</p>
        <p className="producto-precio">{precioFormateado}</p>
        <button
          type="button"
          className="producto-cta"
          onClick={() => onSelectProduct(product.id)}
          aria-label={`Ver detalle de ${product.nombre}`}
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
};
