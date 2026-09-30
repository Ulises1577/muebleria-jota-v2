import React, { useState } from 'react';
import { ProductList } from '../components/ProductList';

export const CatalogPage = ({ products = [], onSelectProduct, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Búsqueda en tiempo real (requisito funcional de productos.js)
  const productosFiltrados = products.filter((p) => {
    const texto = searchTerm.toLowerCase().trim();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto)
    );
  });

  return (
    <main className="catalogo-main">
      <section className="encabezado-catalogo">
        <h1>Nuestra Colección</h1>
        <p>Piezas únicas de mobiliario diseñadas con materiales sostenibles y acabado artesanal.</p>
        
        <div className="buscador-container">
          <input 
            type="text" 
            id="input-busqueda" 
            placeholder="Buscar por nombre o material..." 
            aria-label="Buscar productos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="contenedor-grilla">
        <ProductList 
          products={productosFiltrados}
          onSelectProduct={onSelectProduct}
          isLoading={isLoading}
          error={error}
        />
      </section>
    </main>
  );
};
