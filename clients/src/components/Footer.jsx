import React from 'react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-grid">
        <div>
          <h4 className="footer-brand-title">Hermanos Jota</h4>
          <p className="footer-desc">
            El redescubrimiento de un arte olvidado: muebles cálidos, atemporales y sustentables creados para habitar tu historia.
          </p>
        </div>

        <div>
          <h4 className="footer-col-heading">Navegación</h4>
          <ul className="footer-links-list">
            <li>
              <a href="#inicio" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}>
                Inicio
              </a>
            </li>
            <li>
              <a href="#catalogo" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('catalog'); }}>
                Catálogo
              </a>
            </li>
            <li>
              <a href="#contacto" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('contact'); }}>
                Contacto
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-col-heading">Casa Taller</h4>
          <div className="footer-contact-info">
            <p>Av. San Juan 2847 (San Cristóbal)</p>
            <p>Ciudad Autónoma de Buenos Aires</p>
            <p className="footer-hours"><strong>Horarios:</strong> Lun a Vie 10:00 - 19:00, Sáb 10:00 - 14:00</p>
            <p><strong>WhatsApp:</strong> +54 11 4567-8900</p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Hermanos Jota Muebles. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
