import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductList = ({ products = [], onSelectProduct, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="sin-resultados">
        <p>Cargando catálogo oficial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sin-resultados">
        <p style={{ color: '#b91c1c' }}>⚠️ {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="sin-resultados">No se encontraron productos que coincidan con la búsqueda.</p>
    );
  }

  return (
    <div id="grid-productos" className="grid-productos">
      {products.map((producto) => (
        <ProductCard
          key={producto.id}
          product={producto}
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
};
