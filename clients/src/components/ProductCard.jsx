import React from 'react';

export const ProductCard = ({ product, onSelectProduct }) => {
  const precioFormateado = product.precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  return (
    <article className="tarjeta-producto">
      <img 
        src={product.imagen} 
        alt={product.nombre} 
        className="producto-imagen"
        onClick={() => onSelectProduct(product.id)}
        style={{ cursor: 'pointer' }}
      />
      <div className="producto-info">
        <h3 
          onClick={() => onSelectProduct(product.id)}
          style={{ cursor: 'pointer' }}
        >
          {product.nombre}
        </h3>
        <p className="producto-descripcion">{product.descripcion}</p>
        <p className="producto-precio">{precioFormateado}</p>
        <button 
          type="button"
          className="btn-detalle"
          onClick={() => onSelectProduct(product.id)}
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
};
