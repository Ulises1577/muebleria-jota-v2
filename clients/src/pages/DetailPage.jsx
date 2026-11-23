import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Badge, Button, EmptyState, Eyebrow, Icon } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';
import { useAddToCart, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { productService } from '../services/productService';
import { ROUTES } from '../config/routes';
import { CATALOG, COMMERCE, INVENTORY } from '../config/site';
import { formatCurrency } from '../utils/format';
import { getProductId, getSku, getStockStatus, isSustainable } from '../utils/inventory';

const LONGEVITY = [
  ['Garantía extendida', `${COMMERCE.warrantyYears} años en estructura y 5 años en acabados.`],
  ['Servicio de restauración', 'Recuperamos y renovamos piezas antiguas.'],
  ['Taller de cuidados', 'Capacitación gratuita para clientes.'],
  ['Recompra garantizada', 'Hasta 40% del valor en piezas bien cuidadas.'],
  ['Certificado de trazabilidad', 'Origen de cada material utilizado.']
];

export function DetailPage() {
  const { id } = useParams();
  const { products } = useCatalog();
  const { isAdmin } = useAuth();
  const cart = useCart();
  const addToCart = useAddToCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useDocumentTitle(product?.nombre || 'Producto');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setQuantity(1);
    productService
      .getProductById(id)
      .then((data) => active && setProduct(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // El catálogo compartido tiene el stock más reciente (por ejemplo, después de una compra)
  const live = useMemo(() => {
    if (!product) return null;
    const fresh = products.find((p) => String(getProductId(p)) === String(getProductId(product)));
    return fresh ? { ...product, ...fresh } : product;
  }, [product, products]);

  const related = useMemo(() => {
    if (!live) return [];
    const others = products.filter((p) => String(getProductId(p)) !== String(getProductId(live)));
    const sameCategory = others.filter((p) => p.categoria === live.categoria);
    return [...sameCategory, ...others.filter((p) => p.categoria !== live.categoria)].slice(0, CATALOG.relatedCount);
  }, [live, products]);

  if (loading) {
    return (
      <div className="container detail" aria-busy="true">
        <div className="detail__layout">
          <span className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />
          <div className="detail__info">
            <span className="skeleton" style={{ height: 12, width: '30%' }} />
            <span className="skeleton" style={{ height: 40, width: '80%' }} />
            <span className="skeleton" style={{ height: 28, width: '40%' }} />
            <span className="skeleton" style={{ height: 80 }} />
            <span className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !live) {
    return (
      <div className="container detail">
        <EmptyState
          icon="search"
          title="Producto no encontrado"
          action={
            <Link to={ROUTES.catalog} className="btn btn--outline btn--md">
              <Icon name="arrow-left" size={16} />
              <span>Volver al catálogo</span>
            </Link>
          }
        >
          {error || 'El mueble que buscás no está en nuestro catálogo o cambió de enlace.'}
        </EmptyState>
      </div>
    );
  }

  const status = getStockStatus(live);
  const inCart = cart.items.find((item) => String(getProductId(item)) === String(getProductId(live)))?.quantity || 0;
  const maxSelectable = Math.max(0, cart.maxUnitsFor(live) - inCart);
  const specs = live.especificaciones || {
    Medidas: live.medidas || 'Consultar medidas',
    Materiales: live.materiales || 'Madera maciza',
    Garantía: `${COMMERCE.warrantyYears} años en estructura`
  };

  const handleAdd = () => {
    const added = addToCart(live, quantity);
    if (added > 0) setQuantity(1);
  };

  return (
    <div className="container detail">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <ol>
          <li><Link to={ROUTES.catalog}>Catálogo</Link></li>
          <li><Link to={`${ROUTES.catalog}?categoria=${encodeURIComponent(live.categoria)}`}>{live.categoria}</Link></li>
          <li aria-current="page">{live.nombre}</li>
        </ol>
      </nav>

      <section className="detail__layout" aria-label="Detalle del producto">
        <div className="detail__gallery">
          {isSustainable(live) && (
            <span className="detail__eco">
              <Badge tone="success" className="badge--pill"><Icon name="leaf" size={13} /> Madera certificada · Sostenible</Badge>
            </span>
          )}
          {live.imagenUrl ? <img src={live.imagenUrl} alt={live.nombre} /> : <Icon name="image" size={48} />}
        </div>

        <article className="detail__info">
          <Eyebrow>{live.categoria || INVENTORY.defaultCategory}</Eyebrow>
          <h1 className="detail__title">{live.nombre}</h1>
          <div className="detail__price-row">
            <span className="detail__price">{formatCurrency(live.precio)}</span>
            <span className="text-muted">Hasta {COMMERCE.installments} cuotas sin interés</span>
          </div>
          <p className="detail__description">{live.descripcion}</p>

          <div className="detail__stock">
            <Badge tone={status.tone} dot>{status.label}</Badge>
            {status.key === 'low' && <span className="text-muted">Quedan {live.stock} unidades</span>}
            {isAdmin && <span className="text-muted">SKU {getSku(live)} · {live.stock} en depósito</span>}
          </div>

          {isAdmin ? (
            <Link to={ROUTES.admin} state={{ editProductId: getProductId(live) }} className="btn btn--primary btn--lg btn--block">
              <Icon name="edit" size={16} />
              <span>Editar producto</span>
            </Link>
          ) : (
            <div className="detail__purchase">
              <div className="quantity-stepper">
                <button type="button" onClick={() => setQuantity((q) => q - 1)} disabled={quantity <= 1} aria-label="Reducir cantidad">
                  <Icon name="minus" size={16} />
                </button>
                <input type="number" value={quantity} readOnly aria-label="Cantidad" />
                <button type="button" onClick={() => setQuantity((q) => q + 1)} disabled={quantity >= maxSelectable} aria-label="Aumentar cantidad">
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <Button size="lg" icon="cart" block onClick={handleAdd} disabled={status.key === 'out' || maxSelectable === 0}>
                {status.key === 'out' ? 'Sin stock' : maxSelectable === 0 ? 'Ya está todo en tu carrito' : 'Añadir al carrito'}
              </Button>
            </div>
          )}

          <ul className="detail__trust">
            <li>
              <Icon name="truck" size={20} />
              <div><strong>Envíos a todo el país</strong><span>{COMMERCE.shippingNote}</span></div>
            </li>
            <li>
              <Icon name="shield" size={20} />
              <div><strong>{COMMERCE.warrantyYears} años de garantía</strong><span>Estructuras en maderas nobles</span></div>
            </li>
          </ul>
        </article>
      </section>

      <section className="detail__section" aria-labelledby="specs-title">
        <Eyebrow>Artesanía y medidas</Eyebrow>
        <h2 id="specs-title" className="display-title">Detalles de fabricación</h2>
        <table className="specs-table">
          <tbody>
            {Object.entries(specs).map(([key, value]) => (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <Eyebrow>Compromiso de longevidad</Eyebrow>
        <h2 id="manifesto-title" className="manifesto__title">Programa Herencia Viva</h2>
        <p className="manifesto__text">
          Cada mueble se fabrica con maderas nativas, acabados con aceites ecológicos de bajo COV y está diseñado para envejecer con gracia a lo largo de las décadas.
        </p>
        <ul className="manifesto__list">
          {LONGEVITY.map(([title, text]) => (
            <li key={title}><strong>{title}</strong><span>{text}</span></li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="detail__section" aria-labelledby="related-title">
          <div className="section-heading">
            <div>
              <Eyebrow>Completá tu espacio</Eyebrow>
              <h2 id="related-title" className="display-title">Piezas relacionadas</h2>
            </div>
            <Link to={ROUTES.catalog} className="section-link">Ver catálogo completo <Icon name="arrow-right" size={16} /></Link>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={getProductId(item)} product={item} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
