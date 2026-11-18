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
                <span>Visitar el taller</span>
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

      <section className="container history" aria-labelledby="history-title" data-reveal>
        <div className="history__copy">
          <Eyebrow>Nuestra historia</Eyebrow>
          <h2 id="history-title" className="display-title">Una tradición que sigue viva</h2>
          <p>
            En {BRAND.foundedYear}, Juan José fundó en Buenos Aires una pequeña carpintería que llevaba su apellido y su pasión por el
            trabajo artesanal. Lo que comenzó como un modesto taller pronto se transformó en la reconocida mueblería {BRAND.name}.
          </p>
          <p>Hoy, bajo la dirección de Carla —tercera generación comprometida con la tradición familiar— seguimos creando piezas que acompañan la vida cotidiana.</p>
        </div>
        <aside className="history__highlight">
          <strong>{BRAND.style}</strong>
          Líneas limpias, materiales nobles, funcionalidad clara y una estética atemporal guían cada mueble que sale de nuestra casa taller.
        </aside>
      </section>

      <section className="home-cta" aria-labelledby="cta-title" data-reveal>
        <div className="container home-cta__inner">
          <div>
            <h2 id="cta-title">Las piezas se entienden en persona</h2>
            <p>
              Visitá la casa taller en {WORKSHOP.street}, {WORKSHOP.neighborhood}, y tocá la madera antes de elegir.
            </p>
          </div>
          {!isAdmin && (
            <Link to={ROUTES.contact} className="btn btn--light btn--lg">
              <span>Visitar el taller</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
