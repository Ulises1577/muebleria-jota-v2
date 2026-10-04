import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductList = ({ products = [], onSelectProduct, isLoading, error, onClearFilters }) => {
  if (isLoading) {
    return (
      <div className="grid-productos" aria-busy="true" aria-label="Cargando catálogo">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="tarjeta-producto tarjeta-skeleton" aria-hidden="true">
            <div className="producto-media" />
            <div className="producto-info">
              <span className="skeleton-linea skeleton-linea--corta" />
              <span className="skeleton-linea skeleton-linea--titulo" />
              <span className="skeleton-linea" />
              <span className="skeleton-linea skeleton-linea--precio" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="sin-resultados sin-resultados--error" role="alert">
        <h2>No pudimos cargar el catálogo</h2>
        <p>{error}</p>
        <p>Verificá que el servidor esté en funcionamiento e intentá nuevamente.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="sin-resultados">
        <h2>No encontramos piezas para tu búsqueda</h2>
        <p>Probá con otro nombre, otra categoría o quitá los filtros para ver toda la colección.</p>
        {onClearFilters && (
          <button type="button" className="producto-cta producto-cta--inline" onClick={onClearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>
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
