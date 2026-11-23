import React, { useEffect, useRef } from 'react';
import Sostenibilidad from '../components/Sostenibilidad';

function ZoomImage({ src, alt }) {
  const imgRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (imgRef.current) {
      imgRef.current.style.transition = 'none';
      imgRef.current.style.transformOrigin = `${x}% ${y}%`;
      imgRef.current.style.transform = 'scale(3)';
    }
  };

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (imgRef.current) {
      imgRef.current.style.transition = 'none';
      imgRef.current.style.transformOrigin = `${x}% ${y}%`;
      imgRef.current.style.transform = 'scale(3)';
    }
  };

  const handleMouseLeave = () => {
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.25s ease-out';
      imgRef.current.style.transformOrigin = 'center center';
      imgRef.current.style.transform = 'scale(1)';
    }
  };

  return (
    <div
      className="mid-century-img-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          transformOrigin: 'center center',
          transform: 'scale(1)'
        }}
      />
    </div>
  );
}

export const HomePage = ({ products = [], onSelectProduct, onNavigate, isAdmin = false }) => {
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
            Descubri la sensación de habitar materiales de verdad.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="home-button"
              onClick={() => onNavigate('catalog')}
            >
              Explorar colección
            </button>
            {!isAdmin && (
              <button
                type="button"
                className="home-button home-button--ghost"
                onClick={() => onNavigate('contact')}
              >
                Contanos tu idea
              </button>
            )}
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
            <span className="eyebrow">Selección de la casa</span>
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
              <article key={producto._id} className="featured-card">
                <div 
                  className="featured-image-wrap" 
                  onClick={() => onSelectProduct(producto._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={producto.imagenUrl} alt={producto.nombre} />
                </div>
                <div className="featured-card-body">
                  <span className="featured-category">{producto.categoria || 'Colección'}</span>
                  <h3 
                    onClick={() => onSelectProduct(producto._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {producto.nombre}
                  </h3>
                  <p>{producto.descripcion}</p>
                  <p className="featured-price">{precioFormateado}</p>
                  <button 
                    type="button"
                    className="btn-detalle"
                    onClick={() => onSelectProduct(producto._id)}
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

      {/* Sección Diseño Mid-Century Modern */}
      <section className="mid-century-section" aria-labelledby="mid-century-title" data-reveal>
        <div className="home-container mid-century-container">
          <div className="mid-century-content">
            <h2 id="mid-century-title" className="mid-century-title">
              Diseño Mid-Century Modern
            </h2>
            <p className="mid-century-description">
              Líneas limpias, materiales nobles, funcionalidad clara y una estética atemporal guían cada mueble que sale de nuestra casa taller.
            </p>
            <a
              href="#contacto"
              className="home-button mid-century-button"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('contact');
              }}
            >
              CONTACTANOS
            </a>
          </div>

          <div className="mid-century-gallery" aria-label="Galería de detalles de mobiliario">
            <ZoomImage
              src="/assets/mid_century_1.jpg"
              alt="Detalle de unión y tapizado en cuero de sillón artesanal"
            />
            <ZoomImage
              src="/assets/mid_century_2.jpg"
              alt="Detalle de estantería en madera noble y bronce"
            />
            <ZoomImage
              src="/assets/mid_century_3.jpg"
              alt="Detalle de respaldo tejido y apoyabrazos de madera"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
