import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PUBLIC_NAV, ROUTES } from '../../config/routes';
import { BRAND, WORKSHOP } from '../../config/site';
import { API_ORIGIN, checkApiHealth } from '../../services/apiClient';

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  const { user, isAdmin } = useAuth();
  const links = PUBLIC_NAV.filter((link) => !(link.hideForAdmin && isAdmin));

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">{BRAND.name}</p>
          <p className="footer-desc">{BRAND.description}</p>
        </div>

        <div>
          <h2 className="footer-heading">Navegación</h2>
          <ul className="footer-links">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li>{user ? <Link to={ROUTES.profile}>Mi cuenta</Link> : <Link to={ROUTES.login}>Ingresar</Link>}</li>
          </ul>
        </div>

        <div>
          <h2 className="footer-heading">{WORKSHOP.label}</h2>
          <div className="footer-contact">
            <p>
              {WORKSHOP.street} ({WORKSHOP.neighborhood})
              <br />
              {WORKSHOP.city}
            </p>
            <p>
              <strong>Horarios:</strong> {WORKSHOP.hours.map((slot) => slot.label).join(', ')}
            </p>
            <p>
              <strong>WhatsApp:</strong> {WORKSHOP.whatsapp}
            </p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {YEAR} {BRAND.name}. Todos los derechos reservados.
        </p>
        <p>Desde {BRAND.foundedYear} · {BRAND.style}</p>
      </div>
    </footer>
  );
}

/** Pie compacto del panel: muestra si la API responde, consultando su endpoint de estado. */
export function AdminFooter() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    const check = () => checkApiHealth().then((ok) => active && setApiStatus(ok ? 'online' : 'offline'));
    check();
    const timer = setInterval(check, 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const statusLabel = { checking: 'Verificando servicios…', online: 'Servicios operativos', offline: 'API sin respuesta' }[apiStatus];

  return (
    <footer className="admin-footer">
      <div className="container container--wide admin-footer__inner">
        <div className="admin-footer__left">
          <span className="admin-footer__brand">{BRAND.name}</span>
          <span>
            © {YEAR} · {WORKSHOP.label} {WORKSHOP.neighborhood}, {WORKSHOP.cityShort}
          </span>
        </div>
        <div className="admin-footer__right">
          <a className="admin-footer__link" href={`${API_ORIGIN}/api-docs`} target="_blank" rel="noreferrer">
            Documentación de la API
          </a>
          <span className={`service-status service-status--${apiStatus}`} role="status">
            {statusLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
