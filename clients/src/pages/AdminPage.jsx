import React, { useMemo, useState } from 'react';
import { ProductFormModal } from '../components/ProductFormModal';
import { productService } from '../services/productService';

const formatPrice = (value) => Number(value || 0).toLocaleString('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

const getStockBadge = (stock) => {
  if (stock <= 0) return { label: 'Agotado', className: 'stock-badge stock-badge--out' };
  if (stock <= 3) return { label: 'Últimas unidades', className: 'stock-badge stock-badge--low' };
  return { label: 'En stock', className: 'stock-badge stock-badge--ok' };
};

export const AdminPage = ({ products = [], onProductsChange }) => {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      const nombre = (product.nombre || '').toLowerCase();
      const categoria = (product.categoria || '').toLowerCase();
      return nombre.includes(query) || categoria.includes(query);
    });
  }, [products, search]);

  const metrics = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((product) => Number(product.stock || 0) <= 0).length;
    const inventoryValue = products.reduce((sum, product) => (
      sum + (Number(product.precio || 0) * Number(product.stock || 0))
    ), 0);

    return { total, outOfStock, inventoryValue };
  }, [products]);

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
      await productService.updateProduct(editingProduct._id || editingProduct.id, payload);
      showToast(`Se actualizó ${payload.nombre}.`);
    } else {
      await productService.createProduct(payload);
      showToast(`Se agregó ${payload.nombre} al catálogo.`);
    }

    setFormOpen(false);
    setEditingProduct(null);
    await onProductsChange();
  };

  const handleStockChange = async (product, delta) => {
    const nextStock = Math.max(0, Number(product.stock || 0) + delta);
    if (nextStock === Number(product.stock || 0)) return;

    setBusyId(product._id || product.id);
    try {
      await productService.updateProduct(product._id || product.id, {
        nombre: product.nombre,
        precio: product.precio,
        stock: nextStock,
        categoria: product.categoria,
        descripcion: product.descripcion,
        imagenUrl: product.imagenUrl || product.imagen || ''
      });
      await onProductsChange();
    } catch (error) {
      showToast(error.message || 'No se pudo actualizar el stock.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete._id || pendingDelete.id);
    try {
      await productService.deleteProduct(pendingDelete._id || pendingDelete.id);
      showToast(`${pendingDelete.nombre} fue eliminado del inventario.`);
      setPendingDelete(null);
      await onProductsChange();
    } catch (error) {
      showToast(error.message || 'No se pudo eliminar el mueble.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="contenedor">
          <p className="eyebrow">Panel exclusivo</p>
          <h1>Inventario del taller</h1>
          <p className="admin-hero__texto">
            Controlá piezas, stock y valor estimado del catálogo artesanal de Hermanos Jota.
          </p>
        </div>
      </section>

      <section className="admin-main">
        <div className="contenedor">
          <div className="admin-metrics">
            <article className="admin-metric-card">
              <span className="admin-metric-label">Total de muebles en catálogo</span>
              <strong>{metrics.total}</strong>
            </article>
            <article className="admin-metric-card">
              <span className="admin-metric-label">Piezas agotadas</span>
              <strong>{metrics.outOfStock}</strong>
            </article>
            <article className="admin-metric-card">
              <span className="admin-metric-label">Valor estimado del inventario</span>
              <strong>{formatPrice(metrics.inventoryValue)}</strong>
            </article>
          </div>

          <div className="admin-toolbar">
            <div className="campo admin-search">
              <label htmlFor="admin-search">Buscar en el panel</label>
              <input
                id="admin-search"
                type="search"
                placeholder="Nombre o categoría"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button type="button" className="boton-enviar" onClick={openCreate}>
              + Nuevo mueble
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre / Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-empty">No hay muebles que coincidan con la búsqueda.</td>
                  </tr>
                ) : filteredProducts.map((product) => {
                  const badge = getStockBadge(Number(product.stock || 0));
                  const productId = product._id || product.id;
                  return (
                    <tr key={productId}>
                      <td>
                        <img
                          className="admin-thumb"
                          src={product.imagen || product.imagenUrl}
                          alt={product.nombre}
                        />
                      </td>
                      <td>
                        <strong className="admin-product-name">{product.nombre}</strong>
                        <span className="admin-product-category">{product.categoria}</span>
                      </td>
                      <td>{formatPrice(product.precio)}</td>
                      <td>
                        <div className="admin-stock-cell">
                          <span className={badge.className}>{badge.label}</span>
                          <div className="admin-stock-controls">
                            <button
                              type="button"
                              disabled={busyId === productId || Number(product.stock || 0) <= 0}
                              onClick={() => handleStockChange(product, -1)}
                            >
                              −
                            </button>
                            <span>{product.stock ?? 0}</span>
                            <button
                              type="button"
                              disabled={busyId === productId}
                              onClick={() => handleStockChange(product, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button type="button" className="admin-action admin-action--edit" onClick={() => openEdit(product)}>
                            Editar
                          </button>
                          <button type="button" className="admin-action admin-action--delete" onClick={() => setPendingDelete(product)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

      {pendingDelete && (
        <div className="auth-modal-overlay" onClick={() => setPendingDelete(null)} role="presentation">
          <div className="auth-modal delete-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="esquina esquina--tl" aria-hidden="true"></span>
            <span className="esquina esquina--tr" aria-hidden="true"></span>
            <span className="esquina esquina--bl" aria-hidden="true"></span>
            <span className="esquina esquina--br" aria-hidden="true"></span>
            <h2>Eliminar pieza</h2>
            <p>
              ¿Confirmás eliminar definitivamente <strong>{pendingDelete.nombre}</strong> del inventario? Esta acción no se puede deshacer.
            </p>
            <div className="product-form-actions">
              <button type="button" className="home-button home-button--ghost" onClick={() => setPendingDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="boton-enviar boton-peligro" onClick={handleConfirmDelete} disabled={Boolean(busyId)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast-container" aria-live="polite">
          <div className="custom-toast" style={{
            backgroundColor: 'var(--siena-tostado)',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000
          }}>
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  );
};
