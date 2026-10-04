import React, { useEffect } from 'react';
import Sostenibilidad from "../components/Sostenibilidad";

export const HomePage = ({ products = [], onSelectProduct, onNavigate }) => {
  // Destacados oficiales: IDs 1, 4, 7 y 8
  const destacadosIds = [1, 4, 7, 8];
  const destacados = products.filter(p => destacadosIds.includes(p.id));
  const itemsAMostrar = destacados.length > 0 ? destacados : products.slice(0, 4);

  // --- TRANSICIÓN SUAVE AL SCROLLEAR (GLOBAL) ---
  useEffect(() => {
    const sections = document.querySelectorAll("main section, .home-container, section");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
            observer.unobserve(entry.target); // Se anima una sola vez
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    sections.forEach((sec) => {
      sec.classList.add("section-fade");
      observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-main">
      {/* Hero Section Oficial */}
      <section className="home-hero" aria-labelledby="hero-title">
        <img 
          src="/assets/aparador_uspallata_hero.png" 
          alt="Detalle mueble lateral izquierdo" 
          className="hero-side-img hero-img-left" 
        />

        {/* Tu contenido centrado intacto */}
        <div className="home-container hero-content">
          <h1 id="hero-title">Clase que se siente al tacto</h1>
          <p>
            Más de 30 años creando muebles artesanales, cálidos y duraderos para acompañar la vida de tu hogar.
          </p>
          <button 
            type="button"
            className="home-button" 
            onClick={() => onNavigate('catalog')}
          >
            Explorar colección
          </button>
        </div>

        {/* Imagen derecha */}
        <img 
          src="/assets/sillon_copacabana_hero.png" 
          alt="Detalle mueble lateral derecho" 
          className="hero-side-img hero-img-right" 
        />
      </section>

      {/* Sección Productos Destacados */}
      <section className="home-section home-container" aria-labelledby="featured-title">
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
      <section className="history-section home-container" aria-labelledby="history-title">
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
    </div>
  );
};