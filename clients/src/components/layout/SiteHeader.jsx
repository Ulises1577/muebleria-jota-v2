import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ADMIN_NAV, PUBLIC_NAV, ROUTES } from '../../config/routes';
import { BRAND, WORKSHOP } from '../../config/site';
import { getWorkshopStatus } from '../../utils/hours';
import { getInitials } from '../../utils/format';
import { useDismiss } from '../../hooks';
import { Icon, IconButton } from '../ui';

function useWorkshopStatus() {
  const [status, setStatus] = useState(getWorkshopStatus);
  useEffect(() => {
    const timer = setInterval(() => setStatus(getWorkshopStatus()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return status;
}

function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, close, open);

  const go = (to) => {
    close();
    navigate(to);
  };

  return (
    <div className="user-menu popover-anchor" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-menu__name">{user.nombre}</span>
        <span className="avatar" aria-hidden="true">{getInitials(user.nombre)}</span>
      </button>
      {open && (
        <div className="popover" role="menu">
          <div className="user-menu__meta">
            <strong>{user.nombre}</strong>
            <span>{user.email}</span>
          </div>
          {isAdmin ? (
            <>
              <button type="button" role="menuitem" className="menu-item" onClick={() => go(ROUTES.admin)}>
                <Icon name="layers" size={16} /> Panel de administración
              </button>
              <button type="button" role="menuitem" className="menu-item" onClick={() => go(ROUTES.home)}>
                <Icon name="store" size={16} /> Ver la tienda
              </button>
            </>
          ) : null}
          <button type="button" role="menuitem" className="menu-item" onClick={() => go(ROUTES.profile)}>
            <Icon name="user" size={16} /> Mi cuenta
          </button>
          {!isAdmin && (
            <button type="button" role="menuitem" className="menu-item" onClick={() => go(ROUTES.orders)}>
              <Icon name="receipt" size={16} /> Mis pedidos
            </button>
          )}
          <div className="menu-divider" />
          <button
            type="button"
            role="menuitem"
            className="menu-item menu-item--danger"
            onClick={() => {
              close();
              logout();
              navigate(ROUTES.home);
            }}
          >
            <Icon name="logout" size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const cart = useCart();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const workshop = useWorkshopStatus();

  useEffect(() => setNavOpen(false), [location.pathname]);

  const links = isAdmin ? ADMIN_NAV : PUBLIC_NAV;

  return (
    <header className="site-header">
      <div className={`container ${isAdmin ? 'container--wide' : ''} site-header__inner`}>
        <Link to={ROUTES.home} className="brand" aria-label={`${BRAND.name}, ir al inicio`}>
          <img src={BRAND.logo} alt={BRAND.name} className="brand__logo" />
        </Link>

        <nav className={`main-nav ${navOpen ? 'is-open' : ''}`} id="main-navigation" aria-label="Navegación principal">
          <ul className="main-nav__list">
            {links.map((link) => (
              <li key={link.to + link.label}>
                <NavLink to={link.to} end={link.end} className="main-nav__link">
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {isAdmin && (
            <span
              className={`status-chip ${workshop.isOpen ? '' : 'status-chip--closed'}`}
              title={`${workshop.detail} · ${WORKSHOP.hours.map((slot) => slot.label).join(' · ')}`}
            >
              {workshop.label} · {WORKSHOP.neighborhood}
            </span>
          )}

          {!isAdmin && (
            <button type="button" className="cart-button" onClick={cart.open} aria-label={`Abrir carrito, ${cart.count} productos`}>
              <Icon name="cart" size={18} />
              {cart.count > 0 && <span className="cart-button__count">{cart.count}</span>}
            </button>
          )}

          {user ? (
            <UserMenu />
          ) : (
            <Link to={ROUTES.login} state={{ from: location.pathname }} className="btn btn--primary btn--sm">
              <span>Iniciar sesión</span>
            </Link>
          )}

          <IconButton
            icon={navOpen ? 'x' : 'menu'}
            label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="nav-toggle icon-btn--outline"
            aria-expanded={navOpen}
            aria-controls="main-navigation"
            onClick={() => setNavOpen((value) => !value)}
          />
        </div>
      </div>
    </header>
  );
}
