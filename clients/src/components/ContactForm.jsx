import React, { useState } from 'react';

export const ContactForm = () => {
  // Estado controlado del formulario con useState (Requisito Sprint 3 y 4)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) {
      errs.nombre = 'Por favor, ingresá tu nombre.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Por favor, ingresá tu email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Ingresá un correo electrónico válido.';
    }
    if (!formData.mensaje.trim()) {
      errs.mensaje = 'Por favor, escribí un mensaje.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Apertura del modal de confirmación oficial
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', email: '', mensaje: '' });
    setErrors({});
  };

  return (
    <>
      <div className="panel-form">
        <form id="form-contacto" noValidate onSubmit={handleSubmit}>
          <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
            <label htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              autoComplete="name" 
              aria-describedby="error-nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
            <span className="mensaje-error" id="error-nombre" role="alert">
              {errors.nombre || ''}
            </span>
          </div>

          <div className={`campo ${errors.email ? 'con-error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              autoComplete="email" 
              aria-describedby="error-email"
              value={formData.email}
              onChange={handleChange}
            />
            <span className="mensaje-error" id="error-email" role="alert">
              {errors.email || ''}
            </span>
          </div>

          <div className={`campo ${errors.mensaje ? 'con-error' : ''}`}>
            <label htmlFor="mensaje">Mensaje</label>
            <textarea 
              id="mensaje" 
              name="mensaje" 
              rows="5" 
              aria-describedby="error-mensaje"
              value={formData.mensaje}
              onChange={handleChange}
            ></textarea>
            <span className="mensaje-error" id="error-mensaje" role="alert">
              {errors.mensaje || ''}
            </span>
          </div>

          <button type="submit" className="boton-enviar">
            Enviar mensaje
          </button>
        </form>
      </div>

      {/* Modal de Éxito Oficial de Hermanos Jota */}
      <div 
        className={`modal-overlay ${showModal ? 'modal-overlay--abierto' : ''}`} 
        id="modal-exito"
        aria-hidden={!showModal}
      >
        <div className="modal" role="status">
          <p className="modal__texto">
            Gracias, recibimos tu mensaje. Te respondemos a la brevedad.
          </p>
          <button 
            type="button" 
            className="modal__cerrar" 
            id="modal-cerrar"
            onClick={handleCloseModal}
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};
