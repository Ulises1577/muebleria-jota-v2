import React, { useState } from 'react';
import { ProductList } from '../components/ProductList';

export const CatalogPage = ({ products = [], onSelectProduct, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('default');

  // Búsqueda en tiempo real (requisito funcional de productos.js)
  const productosFiltrados = products.filter((p) => {
    const texto = searchTerm.toLowerCase().trim();

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto);

    const coincideCategoria =
      category === 'Todas' || p.categoria === category;

    return coincideBusqueda && coincideCategoria;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    switch (sortOrder) {
      case 'price-asc':
        return a.precio - b.precio;

      case 'price-desc':
        return b.precio - a.precio;

      case 'name-asc':
        return a.nombre.localeCompare(b.nombre);

      default:
        return 0;
    }
  });

  const limpiarFiltros = () => {
    setSearchTerm('');
    setCategory('Todas');
    setSortOrder('default');
  };

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

<div className="filtros-catalogo">
  <label htmlFor="filtro-categoria">Categoría:</label>

  <select
    id="filtro-categoria"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="Todas">Todas</option>
    <option value="Almacenamiento">Almacenamiento</option>
    <option value="Mesas">Mesas</option>
    <option value="Asientos">Asientos</option>
    <option value="Oficina">Oficina</option>
  </select>

  <label htmlFor="filtro-categoria">Categoría:</label>

  <select
    id="orden-productos"
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
  >
    <option value="default">Relevancia</option>
    <option value="price-asc">Precio: menor a mayor</option>
    <option value="price-desc">Precio: mayor a menor</option>
    <option value="name-asc">Nombre: A-Z</option>
  </select>
</div>

<div className="info-catalogo">
  <p className="contador-resultados">
    {productosOrdenados.length} {productosOrdenados.length === 1 ? 'producto' : 'productos'}
  </p>

  {(searchTerm || category !== 'Todas' || sortOrder !== 'default') && (
    <button
      type="button"
      className="boton-limpiar"
      onClick={limpiarFiltros}
    >
      Limpiar filtros
    </button>
  )}
</div>

</section>

      <section className="contenedor-grilla">
        <ProductList
          products={productosOrdenados}
          onSelectProduct={onSelectProduct}
          isLoading={isLoading}
          error={error}
        />
      </section>
    </main>
  );
};
