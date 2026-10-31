import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_REGISTER = { nombre: '', email: '', password: '', confirmar: '' };

export const LoginModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState(INITIAL_LOGIN);
  const [registerData, setRegisterData] = useState(INITIAL_REGISTER);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setFormError('');
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setFormError('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (!loginData.email.trim() || !loginData.password) {
      setFormError('Completá email y contraseña para ingresar al taller.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const session = await authService.login(loginData);
      setLoginData(INITIAL_LOGIN);
      onAuthSuccess(session);
    } catch (error) {
      setFormError(error.message || 'Email o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
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
      setRegisterData(INITIAL_REGISTER);
      onAuthSuccess(session);
    } catch (error) {
      setFormError(error.message || 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="esquina esquina--tl" aria-hidden="true"></span>
        <span className="esquina esquina--tr" aria-hidden="true"></span>
        <span className="esquina esquina--bl" aria-hidden="true"></span>
        <span className="esquina esquina--br" aria-hidden="true"></span>

        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <p className="auth-eyebrow">Taller Hermanos Jota</p>
        <h2 id="auth-modal-title">Tu cuenta</h2>
        <p className="auth-lead">Ingresá para seguir tu pedido, guardar datos de despacho o administrar el catálogo.</p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-tab ${activeTab === 'login' ? 'is-active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-tab ${activeTab === 'register' ? 'is-active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Crear Cuenta
          </button>
        </div>

        {formError && (
          <div className="auth-alert" role="alert">
            {formError}
          </div>
        )}

        {activeTab === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
            <div className="campo">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={loginData.email}
                onChange={handleLoginChange}
              />
            </div>
            <div className="campo">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>
            <button type="submit" className="boton-enviar auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
            <p className="auth-hint">Demo taller: admin@hermanosjota.com / cliente@hermanosjota.com · 123456</p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
            <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
              <label htmlFor="register-nombre">Nombre</label>
              <input
                id="register-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={registerData.nombre}
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
              />
              <span className="mensaje-error">{errors.confirmar || ''}</span>
            </div>
            <button type="submit" className="boton-enviar auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
