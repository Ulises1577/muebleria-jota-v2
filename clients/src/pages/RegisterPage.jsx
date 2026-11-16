import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const INITIAL_REGISTER = { nombre: '', email: '', password: '', confirmar: '' };

export const RegisterPage = ({ onAuthSuccess }) => {
  const [registerData, setRegisterData] = useState(INITIAL_REGISTER);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!registerData.nombre.trim()) nextErrors.nombre = 'Ingresá tu nombre.';
    if (!registerData.email.trim()) {
      nextErrors.email = 'Ingresá tu email.';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      nextErrors.email = 'Ingresá un correo electrónico válido.';
    }
    if (!registerData.password || registerData.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (registerData.password !== registerData.confirmar) {
      nextErrors.confirmar = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const session = await authService.register({
        nombre: registerData.nombre,
        email: registerData.email,
        password: registerData.password
      });
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo…');
      onAuthSuccess(session);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1200);
    } catch (error) {
      setFormError(error.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <h2>Crear Cuenta</h2>
        <p className="auth-lead">
          Registrate para acceder a todas las funcionalidades de nuestra tienda.
        </p>

        {successMessage && (
          <div className="auth-success" role="status">
            {successMessage}
          </div>
        )}

        {formError && (
          <div className="auth-alert" role="alert">
            {formError}
          </div>
        )}

        {!successMessage && (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
              <label htmlFor="register-nombre">Nombre</label>
              <input
                id="register-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={registerData.nombre}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.nombre || ''}</span>
            </div>
            <div className={`campo ${errors.email ? 'con-error' : ''}`}>
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={registerData.email}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.email || ''}</span>
            </div>
            <div className={`campo ${errors.password ? 'con-error' : ''}`}>
              <label htmlFor="register-password">Contraseña</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={registerData.password}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.password || ''}</span>
            </div>
            <div className={`campo ${errors.confirmar ? 'con-error' : ''}`}>
              <label htmlFor="register-confirmar">Confirmar contraseña</label>
              <input
                id="register-confirmar"
                name="confirmar"
                type="password"
                autoComplete="new-password"
                value={registerData.confirmar}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.confirmar || ''}</span>
            </div>
            <button
              type="submit"
              className="boton-enviar auth-submit"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="auth-hint" style={{ textAlign: 'center' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
