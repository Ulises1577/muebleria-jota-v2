import React, { useEffect, useRef, useState } from 'react';

export const Navbar = ({
  cartCount = 0,
  currentView,
  onNavigate,
  onOpenCart,
  user,
  onOpenLogin,
  onLogout
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLinkClick = (view, e) => {
    e.preventDefault();
    onNavigate(view);
    setIsNavOpen(false);
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.nombre || 'HJ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <a
          href="#inicio"
          className="brand-logo"
          aria-label="Ir a la página de inicio de Hermanos Jota"
          onClick={(e) => handleLinkClick('home', e)}
        >
          <img src="/assets/logo.svg" alt="Hermanos Jota - Muebles y Diseño" className="brand-logo-img" />
        </a>

        <button
          type="button"
          className="nav-toggle"
          data-nav-toggle
          aria-label="Abrir menú de navegación"
          aria-controls="main-navigation"
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen(!isNavOpen)}
        >
          <svg className="nav-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
        </button>

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

        <div className="header-actions">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="user-avatar-btn"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <span className="user-avatar">{initials}</span>
                <span className="user-name">{user.nombre}</span>
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <button type="button" onClick={(e) => handleLinkClick('profile', e)}>
                    Mi Perfil
                  </button>
                  {user.rol === 'admin' && (
                    <>
                      <button type="button" onClick={(e) => handleLinkClick('admin', e)}>
                        Panel Admin
                      </button>
                      <button type="button" onClick={(e) => handleLinkClick('admin-create', e)}>
                        Nuevo mueble
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="session-button" onClick={onOpenLogin}>
              Ingresar
            </button>
          )}

          <button
            type="button"
            className="cart-button"
            aria-label="Cantidad de productos en el carrito"
            onClick={onOpenCart}
          >
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
