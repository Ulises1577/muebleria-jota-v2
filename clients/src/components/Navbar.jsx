import React, { useState } from 'react';

export const Navbar = ({ cartCount = 0, currentView, onNavigate, onOpenCart }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLinkClick = (view, e) => {
    e.preventDefault();
    onNavigate(view);
    setIsNavOpen(false);
  };

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        {/* Logotipo Oficial de Hermanos Jota */}
        <a 
          href="#inicio" 
          className="brand-logo" 
          aria-label="Ir a la página de inicio de Hermanos Jota"
          onClick={(e) => handleLinkClick('home', e)}
        >
          <img src="/assets/logo.svg" alt="Hermanos Jota - Muebles y Diseño" className="brand-logo-img" />
        </a>

        {/* Botón Hamburguesa Móvil */}
        <button 
          type="button" 
          className="nav-toggle" 
          data-nav-toggle 
          aria-label="Abrir menú de navegación" 
          aria-controls="main-navigation" 
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <svg className="nav-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
        </button>

        {/* Menú de Navegación */}
        <nav 
          className={`main-nav ${isNavOpen ? 'is-open' : ''}`} 
          id="main-navigation" 
          data-main-nav 
          aria-label="Navegación principal"
        >
          <ul className="nav-list">
            <li>
              <a 
                href="#inicio" 
                className={`nav-link ${currentView === 'home' ? 'active' : ''}`} 
                data-nav-link="inicio"
                onClick={(e) => handleLinkClick('home', e)}
              >
                Inicio
              </a>
            </li>
            <li>
              <a 
                href="#catalogo" 
                className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`} 
                data-nav-link="catalogo"
                onClick={(e) => handleLinkClick('catalog', e)}
              >
                Catálogo
              </a>
            </li>
            <li>
              <a 
                href="#contacto" 
                className={`nav-link ${currentView === 'contact' ? 'active' : ''}`} 
                data-nav-link="contacto"
                onClick={(e) => handleLinkClick('contact', e)}
              >
                Contacto
              </a>
            </li>
          </ul>
        </nav>

        {/* Carrito con Contador Dinámico */}
        <div className="header-actions">
          <button 
            type="button" 
            className="cart-button" 
            aria-label="Cantidad de productos en el carrito"
            onClick={onOpenCart}
          >
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className={`cart-badge ${cartCount > 0 ? 'bump' : ''}`} data-cart-count aria-live="polite">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
