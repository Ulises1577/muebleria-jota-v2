import React, { useEffect, useRef } from 'react';
import Sostenibilidad from '../components/Sostenibilidad';

export const HomePage = ({ products = [], onSelectProduct, onNavigate }) => {
  // Destacados oficiales: IDs 1, 4, 7 y 8
  const destacadosIds = [1, 4, 7, 8];
  const destacados = products.filter(p => destacadosIds.includes(p.id));
  const itemsAMostrar = destacados.length > 0 ? destacados : products.slice(0, 4);

  // Revelado suave al hacer scroll (solo se activa si hay JS; respeta prefers-reduced-motion vía CSS)
  const mainRef = useRef(null);
  useEffect(() => {
    const root = mainRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    root.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => { io.disconnect(); root.classList.remove('reveal-ready'); };
  }, []);

  return (
    <div className="home-main" ref={mainRef}>
      {/* Hero: mismo concepto (aparador | título centrado | sillón), refinado */}
      <section className="home-hero" aria-labelledby="hero-title">
        <img
          src="/assets/aparador_uspallata_hero.png"
          alt="Aparador Uspallata en nogal con frente de rejilla"
          className="hero-side-img hero-img-left"
          decoding="async"
        />

        <div className="home-container hero-content">
          <h1 id="hero-title">Clase que se siente al tacto</h1>
          <p>
            Descubri la sensación de habitar Materiales de Verdad.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="home-button"
              onClick={() => onNavigate('catalog')}
            >
              Explorar colección
            </button>
            <button
              type="button"
              className="home-button home-button--ghost"
              onClick={() => onNavigate('contact')}
            >
              Visitar el taller
            </button>
          </div>
        </div>

        <img
          src="/assets/sillon_copacabana_hero.png"
          alt="Sillón Copacabana en cuero y madera"
          className="hero-side-img hero-img-right"
          decoding="async"
        />
      </section>

      {/* Datos de la casa (solo información ya presente en el sitio) */}
      <ul className="home-values" aria-label="Sobre Hermanos Jota">
        <li>Desde 1960</li>
        <li>Casa taller en San Cristóbal</li>
        <li>Diseño Mid-Century Modern</li>
      </ul>

      {/* Sección Productos Destacados */}
      <section className="home-section home-container" aria-labelledby="featured-title" data-reveal>
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Selección de la casa</span>
            <h2 id="featured-title">Productos destacados</h2>
          </div>
          <a 
            href="#catalogo" 
            className="section-link"
            onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
          >
            Ver catálogo completo →
          </a>
        </div>

        <div id="featured-products-grid" className="featured-products-grid" aria-live="polite">
          {itemsAMostrar.map((producto) => {
            const precioFormateado = new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0
            }).format(producto.precio);

            return (
              <article key={producto.id} className="featured-card">
                <div 
                  className="featured-image-wrap" 
                  onClick={() => onSelectProduct(producto.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={producto.imagen} alt={producto.nombre} />
                </div>
                <div className="featured-card-body">
                  <span className="featured-category">{producto.categoria || 'Colección'}</span>
                  <h3 
                    onClick={() => onSelectProduct(producto.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {producto.nombre}
                  </h3>
                  <p>{producto.descripcion}</p>
                  <p className="featured-price">{precioFormateado}</p>
                  <button 
                    type="button"
                    className="btn-detalle"
                    onClick={() => onSelectProduct(producto.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--siena-tostado)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                      textDecoration: 'underline'
                    }}
                  >
                    Ver detalle
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Nueva sección Sostenibilidad */}
      <Sostenibilidad />

      {/* Sección Historia Oficial */}
      <section className="history-section home-container" aria-labelledby="history-title" data-reveal>
        <div className="history-copy">
          <span className="section-eyebrow">Nuestra historia</span>
          <h2 id="history-title">Una tradición que sigue viva</h2>
          <p>
            En 1960, Juan José fundó en Buenos Aires una pequeña carpintería que llevaba su apellido y su pasión por el trabajo artesanal. Lo que comenzó como un modesto taller pronto se transformó en la reconocida mueblería Hermanos Jota.
          </p>
          <p>
            Hoy, bajo la dirección de Carla —tercera generación comprometida con la tradición familiar— seguimos creando piezas que acompañan la vida cotidiana.
          </p>
        </div>
        <aside className="history-highlight">
          <strong>Diseño Mid-Century Modern</strong>
          Líneas limpias, materiales nobles, funcionalidad clara y una estética atemporal guían cada mueble que sale de nuestra casa taller.
        </aside>
      </section>

      {/* Cierre de la página */}
      <section className="home-cta" aria-labelledby="cta-title" data-reveal>
        <div className="home-container home-cta-inner">
          <div>
            <h2 id="cta-title">Las piezas se entienden en persona</h2>
            <p>Visitá la casa taller en Av. San Juan 2847, San Cristóbal, y tocá la madera antes de elegir.</p>
          </div>
          <button type="button" className="home-button home-button--light" onClick={() => onNavigate('contact')}>
            Visitar el taller
          </button>
        </div>
      </section>
    </div>
  );
};