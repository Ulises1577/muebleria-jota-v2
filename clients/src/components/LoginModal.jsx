import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_REGISTER = { nombre: '', email: '', password: '', confirmar: '' };

export const LoginModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [activeRole, setActiveRole] = useState(null);
  const [loginData, setLoginData] = useState(INITIAL_LOGIN);
  const [registerData, setRegisterData] = useState(INITIAL_REGISTER);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add('modal-open');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
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

  // Opción B: Selector claro de rol / Acceso rápido
  const handleQuickLogin = async (role) => {
    setActiveRole(role);
    setFormError('');
    setIsSubmitting(true);

    const email = role === 'admin' ? 'admin@hermanosjota.com' : 'cliente@hermanosjota.com';
    const password = '123456';
    setLoginData({ email, password });

    try {
      const session = await authService.login({ email, password });
      onAuthSuccess(session);
    } catch (error) {
      setFormError(error.message || 'Error al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opción A: Envío del formulario de credenciales a POST /api/auth/login
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (!loginData.email.trim() || !loginData.password) {
      setFormError('Completá email y contraseña para ingresar.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const session = await authService.login(loginData);
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
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <h2 id="auth-modal-title">Iniciar Sesión</h2>
        <p className="auth-lead" style={{ marginBottom: '1.25rem' }}>
          Elegí tu rol para ingresar al sistema o usá tus credenciales.
        </p>

        <div className="auth-tabs" role="tablist" style={{ marginBottom: '1.25rem' }}>
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
          <div className="auth-alert" role="alert" style={{ marginBottom: '1rem' }}>
            {formError}
          </div>
        )}

        {activeTab === 'login' ? (
          <div>
            {/* Opción B: Selector claro / Botones de rol para acceso rápido */}
            <div className="login-role-selector" style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                Seleccionar rol (Acceso rápido):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="session-button"
                  style={{
                    background: activeRole === 'client' ? 'var(--siena-tostado)' : 'var(--alabastro-calido)',
                    color: activeRole === 'client' ? '#fff' : 'var(--siena-tostado)',
                    border: '1px solid var(--color-border)',
                    padding: '0.75rem 0.5rem',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleQuickLogin('client')}
                  disabled={isSubmitting}
                >
                  Iniciar como Cliente
                </button>
                <button
                  type="button"
                  className="session-button"
                  style={{
                    background: activeRole === 'admin' ? 'var(--siena-tostado)' : 'var(--alabastro-calido)',
                    color: activeRole === 'admin' ? '#fff' : 'var(--siena-tostado)',
                    border: '1px solid var(--color-border)',
                    padding: '0.75rem 0.5rem',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isSubmitting}
                >
                  Iniciar como Administrador
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.25rem 0',
              color: 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></span>
              <span style={{ padding: '0 0.75rem' }}>o con tus credenciales</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></span>
            </div>

            {/* Opción A: Formulario de credenciales reales */}
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
              <button type="submit" className="boton-enviar auth-submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
                {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>
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
            <button type="submit" className="boton-enviar auth-submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
