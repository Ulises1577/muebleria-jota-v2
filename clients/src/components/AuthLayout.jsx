import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, WORKSHOP } from '../config/site';
import { ROUTES } from '../config/routes';
import { Icon } from './ui';

/** Marco compartido de Login y Registro: panel de marca + tarjeta de formulario. */
export function AuthLayout({ eyebrow, title, lead, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <Link to={ROUTES.home} className="brand brand--inverse" aria-label={`${BRAND.name}, volver al inicio`}>
          <img src={BRAND.logo} alt="" className="brand__logo" />
          <span className="brand__text">
            <span className="brand__name">{BRAND.name}</span>
            <span className="brand__tagline">{BRAND.tagline}</span>
          </span>
        </Link>
        <div className="auth__quote">
          <p>Clase que se siente al tacto.</p>
          <span>
            Desde {BRAND.foundedYear} · {WORKSHOP.label} en {WORKSHOP.neighborhood}
          </span>
        </div>
        <img src="/assets/sillon_copacabana_hero.png" alt="" className="auth__image" />
      </aside>

      <main className="auth__panel">
        <Link to={ROUTES.home} className="auth__back">
          <Icon name="arrow-left" size={16} /> Volver a la tienda
        </Link>
        <div className="auth__card">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {lead && <p className="page-lead">{lead}</p>}
          <div className="auth__body">{children}</div>
          {footer && <p className="auth__footer">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
