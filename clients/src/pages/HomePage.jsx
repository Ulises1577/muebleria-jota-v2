import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sostenibilidad from '../components/Sostenibilidad';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { Eyebrow, Icon } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { ROUTES } from '../config/routes';
import { BRAND, CATALOG, WORKSHOP } from '../config/site';
import { getProductId, getStockStatus } from '../utils/inventory';

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    root.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
  return ref;
}

/** Foto de la galería Mid-Century: al pasar el mouse se amplía siguiendo el cursor. */
function ZoomImage({ src, alt }) {
  const imgRef = useRef(null);

  const zoomAt = (event) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    img.style.transition = 'none';
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(3)';
  };

  const resetZoom = () => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = 'transform 0.25s ease-out';
    img.style.transformOrigin = 'center center';
    img.style.transform = 'scale(1)';
  };

  return (
    <div className="mid-century__img" onMouseEnter={zoomAt} onMouseMove={zoomAt} onMouseLeave={resetZoom}>
      <img ref={imgRef} src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

export function HomePage() {
  useDocumentTitle(null);
  const { products, isLoading } = useCatalog();
  const { isAdmin } = useAuth();
  const ref = useScrollReveal();

  // Destacados: primero las piezas con stock, en el orden del catálogo
  const featured = [...products]
    .sort((a, b) => Number(getStockStatus(a).key === 'out') - Number(getStockStatus(b).key === 'out'))
    .slice(0, CATALOG.featuredCount);

  return (
    <div className="home" ref={ref}>
      <section className="home-hero" aria-labelledby="hero-title">
        <img src="/assets/aparador_uspallata_hero.png" alt="" className="home-hero__img home-hero__img--left" decoding="async" />
        <div className="container home-hero__content">
          <h1 id="hero-title" className="home-hero__title">Clase que se siente al tacto</h1>
          <p className="home-hero__lead">Descubrí la sensación de habitar materiales de verdad.</p>
          <div className="home-hero__actions">
            <Link to={ROUTES.catalog} className="btn btn--primary btn--lg">
              <span>Explorar colección</span>
            </Link>
            {!isAdmin && (
              <Link to={ROUTES.contact} className="btn btn--outline btn--lg">
                <span>Contanos tu idea</span>
              </Link>
            )}
          </div>
        </div>
        <img src="/assets/sillon_copacabana_hero.png" alt="" className="home-hero__img home-hero__img--right" decoding="async" />
      </section>

      <ul className="home-values" aria-label={`Sobre ${BRAND.name}`}>
        <li>Desde {BRAND.foundedYear}</li>
        <li>
          {WORKSHOP.label} en {WORKSHOP.neighborhood}
        </li>
        <li>{BRAND.style}</li>
      </ul>

      <section className="container home-section" aria-labelledby="featured-title" data-reveal>
        <div className="section-heading">
          <div>
            <Eyebrow>Selección de la casa</Eyebrow>
            <h2 id="featured-title" className="display-title">Productos destacados</h2>
          </div>
          <Link to={ROUTES.catalog} className="section-link">
            Ver catálogo completo <Icon name="arrow-right" size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {isLoading
            ? Array.from({ length: CATALOG.featuredCount }).map((_, index) => <ProductCardSkeleton key={index} />)
            : featured.map((product) => (
                <ProductCard key={getProductId(product)} product={product} />
              ))}
        </div>
      </section>

      <Sostenibilidad />

      <section className="mid-century" aria-labelledby="mid-century-title" data-reveal>
        <div className="container mid-century__inner">
          <div className="mid-century__copy">
            <h2 id="mid-century-title" className="mid-century__title">{BRAND.style}</h2>
            <p className="mid-century__text">
              Líneas limpias, materiales nobles, funcionalidad clara y una estética atemporal guían cada mueble que sale de nuestra casa taller.
            </p>
            {!isAdmin && (
              <Link to={ROUTES.contact} className="btn btn--primary btn--lg">
                <span>Contactanos</span>
              </Link>
            )}
          </div>

          <div className="mid-century__gallery" aria-label="Galería de detalles de mobiliario">
            <ZoomImage src="/assets/mid_century_1.jpg" alt="Detalle de unión y tapizado en cuero de sillón artesanal" />
            <ZoomImage src="/assets/mid_century_2.jpg" alt="Detalle de estantería en madera noble y bronce" />
            <ZoomImage src="/assets/mid_century_3.jpg" alt="Detalle de respaldo tejido y apoyabrazos de madera" />
          </div>
        </div>
      </section>
    </div>
  );
}
