import React from 'react';

const ROWS = [
  {
    title: 'El respeto empieza en la raíz.',
    before: 'El diseño nace en la tierra. Elegimos maderas nativas de bosques argentinos gestionados con responsabilidad: ',
    accent: 'algarrobo, caldén y quebracho',
    after: '. Especies nobles que conocen nuestro suelo.',
    image: '/assets/sostenibilidad_img1.png',
    alt: 'Corte transversal de un tronco de algarrobo'
  },
  {
    title: 'La belleza de lo que ya vivió.',
    before: 'El pasado tiene valor. Integramos un ',
    accent: 'mínimo de 30% de madera recuperada',
    after: ', rescatando vetas y marcas que ningún proceso industrial puede replicar.',
    image: '/assets/sostenibilidad_img2.png',
    alt: 'Unión de madera recuperada y madera nueva'
  },
  {
    title: 'Cercanía, oficio y aire limpio.',
    before: 'Oficio local en el Gran Buenos Aires y ',
    accent: 'acabados de bajo COV, libres de toxinas',
    after: '. Cuidamos a los artesanos y creamos piezas que respiran con tu hogar.',
    image: '/assets/sostenibilidad_img3.png',
    alt: 'Acabado natural de madera'
  }
];

export default function Sostenibilidad() {
  return (
    <section className="sostenibilidad" id="sostenibilidad" aria-label="Sostenibilidad">
      <div className="sostenibilidad__container">
        {ROWS.map((row, index) => (
          <article key={row.title} className={`sostenibilidad__row ${index % 2 ? 'sostenibilidad__row--reverse' : ''}`} data-reveal>
            <div className="sostenibilidad__copy">
              <h2 className="sostenibilidad__title">{row.title}</h2>
              <p className="sostenibilidad__text">
                {row.before}
                <span className="sostenibilidad__accent">{row.accent}</span>
                {row.after}
              </p>
            </div>
            <div className="sostenibilidad__media">
              <img src={row.image} alt={row.alt} loading="lazy" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
