export default function Sostenibilidad() {
  return (
    <section className="sostenibilidad" id="sostenibilidad">
      <div className="sostenibilidad__container">

        {/* Fila 1 */}
        <article className="sostenibilidad__row reveal reveal--left">
          <div className="sostenibilidad__copy">
            <h2 className="sostenibilidad__title">
              El respeto empieza en la raíz.
            </h2>
            <p className="sostenibilidad__text">
              El diseño nace en la tierra. Elegimos maderas nativas
              de bosques argentinos gestionados con responsabilidad:{" "}
              <span className="sostenibilidad__accent">
                algarrobo, caldén y quebracho
              </span>.
              Especies nobles que conocen nuestro suelo.
            </p>
          </div>

          <div className="sostenibilidad__media">
            <img
              src="/assets/sostenibilidad_img1.png"
              alt="Corte transversal de un tronco de algarrobo"
              loading="lazy"
            />
          </div>
        </article>

        {/* Fila 2 (Invertida) */}
        <article className="sostenibilidad__row sostenibilidad__row--reverse reveal reveal--right">
          <div className="sostenibilidad__copy">
            <h2 className="sostenibilidad__title">
              La belleza de lo que ya vivió.
            </h2>
            <p className="sostenibilidad__text">
              El pasado tiene valor. Integramos un{" "}
              <span className="sostenibilidad__accent">
                mínimo de 30% de madera recuperada
              </span>,
              rescatando vetas y marcas que ningún proceso industrial
              puede replicar.
            </p>
          </div>

          <div className="sostenibilidad__media">
            <img
              src="/assets/sostenibilidad_img2.png"
              alt="Unión de madera recuperada y madera nueva"
              loading="lazy"
            />
          </div>
        </article>

        {/* Fila 3 */}
        <article className="sostenibilidad__row reveal reveal--left">
          <div className="sostenibilidad__copy">
            <h2 className="sostenibilidad__title">
              Cercanía, oficio y aire limpio.
            </h2>
            <p className="sostenibilidad__text">
              Oficio local en el Gran Buenos Aires y{" "}
              <span className="sostenibilidad__accent">
                acabados de bajo COV, libres de toxinas
              </span>.
              Cuidamos a los artesanos y creamos piezas que respiran
              con tu hogar.
            </p>
          </div>

          <div className="sostenibilidad__media">
            <img
              src="/assets/sostenibilidad_img3.png"
              alt="Acabado natural de madera"
              loading="lazy"
            />
          </div>
        </article>

      </div>
    </section>
  );
}