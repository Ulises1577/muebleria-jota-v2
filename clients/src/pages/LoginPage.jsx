import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { ROUTES } from '../config/routes';

const DEMO_ACCOUNTS = import.meta.env.DEV
  ? [
      { label: 'Admin', email: 'admin@hermanosjota.com' },
      { label: 'Cliente', email: 'cliente@hermanosjota.com' }
    ]
  : [];

export function LoginPage() {
  useDocumentTitle('Iniciar sesión');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const notice = location.state?.expired
    ? 'Tu sesión venció. Ingresá de nuevo para continuar.'
    : location.state?.reason === 'checkout'
      ? 'Ingresá para finalizar tu compra. Tu carrito queda guardado.'
      : '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!data.email.trim() || !data.password) {
      setError('Completá email y contraseña para ingresar.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({ email: data.email.trim(), password: data.password });
      navigate(location.state?.from || (user.isAdmin ? ROUTES.admin : ROUTES.home), { replace: true });
    } catch (err) {
      setError(err.message || 'Email o contraseña incorrectos.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Acceso clientes y taller"
      title="Iniciar sesión"
      lead="Ingresá para comprar, seguir tus pedidos o administrar el catálogo."
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link to={ROUTES.register} state={location.state} className="text-link">
            Crear una cuenta
          </Link>
        </>
      }
    >
      {notice && <Alert tone="info">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field label="Email" htmlFor="login-email">
          <Input id="login-email" name="email" type="email" autoComplete="email" value={data.email} onChange={handleChange} />
        </Field>
        <Field label="Contraseña" htmlFor="login-password">
          <Input id="login-password" name="password" type="password" autoComplete="current-password" value={data.password} onChange={handleChange} />
        </Field>
        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      {DEMO_ACCOUNTS.length > 0 && (
        <div className="demo-accounts">
          <p className="field__label">Cuentas de prueba (entorno de desarrollo)</p>
          <ul>
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button type="button" className="demo-accounts__item" onClick={() => setData({ email: account.email, password: '' })}>
                  <strong>{account.label}</strong> {account.email}
                </button>
              </li>
            ))}
          </ul>
          <p className="field__hint">Contraseña de las cuentas semilla: la definida en el backend (123456 por defecto).</p>
        </div>
      )}
    </AuthLayout>
  );
}
