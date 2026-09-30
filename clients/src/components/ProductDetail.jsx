import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const ProductDetail = ({ productId, onBack, onAddToCart, onSelectRelated }) => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setQuantity(1);

    // Carga de producto seleccionado y catálogo para piezas relacionadas
    Promise.all([
      productService.getProductById(productId),
      productService.getProducts()
    ])
      .then(([currentData, allProducts]) => {
        if (isMounted) {
          setProduct(currentData);
          // Filtrar relacionados de la misma categoría o complementarios (excluyendo el actual)
          const related = allProducts
            .filter((p) => p.id !== currentData.id)
            .slice(0, 3);
          setRelatedProducts(related);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el producto.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    onAddToCart(product, quantity);
    setToastMessage(`Se agregaron ${quantity} unidad(es) de ${product.nombre} al carrito.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  if (isLoading) {
    return (
      <main className="main-content container">
        <div id="product-loader" aria-busy="true" aria-label="Cargando detalles del producto">
          <div className="product-detail-layout">
            <div className="loading-skeleton skeleton-image"></div>
            <div className="skeleton-details">
              <div className="loading-skeleton skeleton-category"></div>
              <div className="loading-skeleton skeleton-title"></div>
              <div className="loading-skeleton skeleton-price"></div>
              <div className="loading-skeleton skeleton-description"></div>
              <div className="loading-skeleton skeleton-action"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="main-content container">
        <div id="product-error" className="product-not-found">
          <h2>Producto no encontrado</h2>
          <p>El mueble que estás buscando no se encuentra en nuestro catálogo o ha cambiado de enlace.</p>
          <button type="button" className="btn-secondary" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver al Catálogo
          </button>
        </div>
      </main>
    );
  }

  const precioFormateado = product.precio.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  const especificaciones = product.especificaciones || {
    "Medidas": product.medidas || "Consultar medidas",
    "Materiales": product.materiales || "Madera maciza certificada FSC®",
    "Garantía": "10 años en estructura"
  };

  return (
    <>
      {/* Migas de Pan (Breadcrumbs) */}
      <div className="container" style={{ marginTop: '1rem' }}>
        <nav className="breadcrumbs-nav" aria-label="Ruta de navegación">
          <ol className="breadcrumbs-list">
            <li className="breadcrumb-item">
              <a href="#catalogo" onClick={(e) => { e.preventDefault(); onBack(); }}>Catálogo</a>
            </li>
            <li className="breadcrumb-separator" aria-hidden="true">/</li>
            <li className="breadcrumb-item active" aria-current="page">{product.nombre}</li>
          </ol>
        </nav>
      </div>

      <main className="main-content container">
        <div id="product-content">
          <section className="product-detail-layout" aria-label="Detalle del producto">
            {/* Galería / Imagen Principal */}
            <div className="product-gallery">
              <div className="product-badge-sustainability">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Madera FSC® • Sostenible
              </div>
              <div className="product-main-image-container">
                <img id="product-image" className="product-main-img" src={product.imagen} alt={product.nombre} />
              </div>
            </div>

            {/* Panel de Información y Compra */}
            <article className="product-info-panel">
              <div>
                <span className="product-category-tag">{product.categoria || 'Colección'}</span>
                <h1 className="product-title">{product.nombre}</h1>
              </div>

              <div className="product-pricing-box">
                <span className="product-price">{precioFormateado}</span>
                <span className="product-installments">Hasta 6 cuotas sin interés</span>
              </div>

              <p className="product-description">{product.descripcion}</p>

              {/* Controles de Compra */}
              <div className="purchase-controls">
                <div className="quantity-control-group">
                  <label htmlFor="qty-input" className="quantity-label">Cantidad:</label>
                  <div className="quantity-stepper">
                    <button 
                      type="button" 
                      className="quantity-btn" 
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      id="qty-input" 
                      className="quantity-input" 
                      value={quantity} 
                      readOnly 
                      aria-label="Cantidad a comprar" 
                    />
                    <button 
                      type="button" 
                      className="quantity-btn" 
                      onClick={handleIncrease}
                      disabled={quantity >= 10}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="add-to-cart-btn" 
                  onClick={handleAddToCartClick}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Añadir al Carrito
                </button>
              </div>

              {/* Badges de Confianza */}
              <div className="trust-badges-grid">
                <div className="trust-item">
                  <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <div>
                    <p className="trust-text-title">Envíos a todo el país</p>
                    <p className="trust-text-sub">Embalaje reforzado sin plásticos</p>
                  </div>
                </div>

                <div className="trust-item">
                  <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <div>
                    <p className="trust-text-title">10 años de garantía</p>
                    <p className="trust-text-sub">Estructuras en maderas nobles</p>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* Sección: Detalles de Fabricación y Especificaciones Técnicas */}
          <section className="specs-section" aria-labelledby="specs-heading">
            <div className="section-header-wrap">
              <span className="section-subtitle">Artesanía y Medidas</span>
              <h2 className="section-heading" id="specs-heading">Detalles de Fabricación</h2>
            </div>

            <div className="specs-table-container">
              <table className="specs-table" aria-describedby="specs-heading">
                <tbody>
                  {Object.entries(especificaciones).map(([clave, valor]) => (
                    <tr key={clave}>
                      <th scope="row">{clave}</th>
                      <td>{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Banner Herencia Viva */}
          <section className="brand-manifesto-banner" aria-label="Compromiso de longevidad">
            <span className="section-subtitle">Compromiso de longevidad</span>
            <h3 className="manifesto-title">Programa Herencia Viva</h3>
            <p className="manifesto-text">
              Cada mueble de Hermanos Jota es fabricado con maderas nativas certificadas FSC®, acabados con aceites 100% ecológicos de bajo COV y diseñado para envejecer con gracia a lo largo de las décadas. Ofrecemos servicio de restauración y garantía extendida en estructura.
            </p>
            <ul className="longevity-benefits">
              <li><strong>Garantía extendida</strong><span>10 años en estructura y 5 años en acabados.</span></li>
              <li><strong>Servicio de restauración</strong><span>Recuperamos y renovamos piezas antiguas.</span></li>
              <li><strong>Taller de cuidados</strong><span>Capacitación gratuita para clientes.</span></li>
              <li><strong>Recompra garantizada</strong><span>Hasta 40% del valor en piezas bien cuidadas.</span></li>
              <li><strong>Certificado de trazabilidad</strong><span>Origen de cada material utilizado.</span></li>
            </ul>
          </section>

          {/* Piezas Relacionadas */}
          {relatedProducts.length > 0 && (
            <section className="related-products-section" aria-labelledby="related-heading">
              <div className="section-header-wrap related-products-header">
                <div>
                  <span className="section-subtitle">Completá tu espacio</span>
                  <h2 className="section-heading" id="related-heading">Piezas Relacionadas</h2>
                </div>
                <a 
                  href="#catalogo" 
                  className="related-catalog-link"
                  onClick={(e) => { e.preventDefault(); onBack(); }}
                >
                  Ver Catálogo Completo →
                </a>
              </div>

              <div className="related-products-grid">
                {relatedProducts.map((rel) => {
                  const relPrice = rel.precio.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0
                  });
                  return (
                    <article 
                      key={rel.id} 
                      className="related-card" 
                      onClick={() => onSelectRelated && onSelectRelated(rel.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="related-image-wrap">
                        <img src={rel.imagen} alt={rel.nombre} />
                      </div>
                      <div className="related-card-body">
                        <span className="related-category">{rel.categoria || 'Colección'}</span>
                        <h4 className="related-title">{rel.nombre}</h4>
                        <p className="related-price">{relPrice}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Notificación Toast Flotante */}
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
    </>
  );
};
