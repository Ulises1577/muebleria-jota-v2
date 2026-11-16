import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const INITIAL_LOGIN = { email: '', password: '' };

export const LoginPage = ({ onAuthSuccess }) => {
  const [loginData, setLoginData] = useState(INITIAL_LOGIN);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
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
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Email o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <h2>Iniciar Sesión</h2>
        <p className="auth-lead">
          Ingresá con tus credenciales para acceder al sistema.
        </p>

        <div className="test-credentials-info">
          <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#333' }}>
            Cuentas de prueba
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontFamily: 'monospace' }}>
            <span><strong>Admin:</strong> admin@hermanosjota.com / 123456</span>
            <span><strong>Cliente:</strong> cliente@hermanosjota.com / 123456</span>
          </div>
        </div>

        {formError && (
          <div className="auth-alert" role="alert">
            {formError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={loginData.email}
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="boton-enviar auth-submit"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-hint" style={{ textAlign: 'center' }}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="auth-link">
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
};
