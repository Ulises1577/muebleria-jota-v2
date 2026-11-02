import React, { useEffect, useState } from 'react';
import { ProductFormModal } from '../components/ProductFormModal';
import { productService } from '../services/productService';

export const AdminPage = ({ onProductsChange, editProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
      if (onProductsChange) {
        onProductsChange();
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Abre el modal de edición automáticamente si se recibe un ID específico
  useEffect(() => {
    if (editProductId && products.length > 0) {
      const target = products.find((p) => (p._id || p.id) === editProductId);
      if (target) {
        setEditingProduct(target);
        setFormOpen(true);
      }
    }
  }, [editProductId, products]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    if (editingProduct) {
      const id = editingProduct._id || editingProduct.id;
      await productService.updateProduct(id, payload);
    } else {
      await productService.createProduct(payload);
    }

    setFormOpen(false);
    setEditingProduct(null);
    await loadProducts();
  };

  const handleDelete = async (product) => {
    const id = product._id || product.id;
    if (!id) return;

    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.nombre}"?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto.');
      setLoading(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="contenedor">
          <p className="eyebrow">Panel de Administración</p>
          <h1>Gestión de Productos</h1>
        </div>
      </section>

      <section className="admin-main">
        <div className="contenedor">
          <div className="admin-toolbar">
            <button type="button" className="boton-enviar" onClick={openCreate}>
              Nuevo Producto
            </button>
          </div>

          {error && (
            <div className="auth-alert" role="alert" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="admin-loading" role="status">Cargando productos...</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-empty">No hay productos disponibles.</td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const productId = product._id || product.id;
                      return (
                        <tr key={productId}>
                          <td>
                            <img
                              className="admin-thumb"
                              src={product.imagenUrl || product.imagen || ''}
                              alt={product.nombre}
                              onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />
                          </td>
                          <td>
                            <strong className="admin-product-name">{product.nombre}</strong>
                          </td>
                          <td>{product.categoria || 'Colección'}</td>
                          <td>${Number(product.precio || 0).toFixed(2)}</td>
                          <td>{product.stock ?? 0}</td>
                          <td>{product.descripcion || ''}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-action admin-action--edit"
                                onClick={() => openEdit(product)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="admin-action admin-action--delete"
                                onClick={() => handleDelete(product)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <ProductFormModal
        isOpen={formOpen}
        product={editingProduct}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
      />
    </main>
  );
};