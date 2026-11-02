import React from 'react';
import { ContactForm } from '../components/ContactForm';

export const ContactPage = ({ prefill = null }) => {
  return (
    <main>
      <section className="contacto-hero">
        <div className="contenedor">
          <p className="eyebrow">Taller &amp; atención al cliente</p>
          <h1>Hablemos de tu próximo mueble</h1>
          <p className="contacto-hero__texto">
            Cada pieza de Hermanos Jota sale de un taller familiar, no de una línea de producción. Contanos qué estás buscando y te respondemos con la misma atención que le damos a cada tablón de madera que entra al taller.
          </p>
        </div>
      </section>

      <section className="contacto-main">
        <div className="contenedor contacto-grid">
          {/* Panel Lateral Institucional */}
          <aside className="panel-info" aria-label="Información de contacto">
            <h2>Taller Hermanos Jota</h2>
            <p className="panel-info__desc">
              Trabajamos con stock reducido de piezas listas y producción a medida. Contanos tu proyecto y te contamos los tiempos reales.
            </p>
            <dl className="panel-info__datos">
              <div>
                <dt>Showroom y taller</dt>
                <dd>Av. San Juan 2847, San Cristóbal, CABA</dd>
              </div>
              <div>
                <dt>Horario de atención</dt>
                <dd>Lunes a viernes 10 a 19 hs, sábados 10 a 14 hs</dd>
              </div>
              <div>
                <dt>Teléfono directo</dt>
                <dd>+54 11 4892-3001</dd>
              </div>
              <div>
                <dt>Correo electrónico</dt>
                <dd>contacto@hermanosjota.com.ar</dd>
              </div>
            </dl>
          </aside>

          {/* Formulario */}
          <ContactForm prefill={prefill} />
        </div>
      </section>
    </main>
  );
};
