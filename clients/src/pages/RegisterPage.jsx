import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Alert, Button, Field, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { ROUTES } from '../config/routes';

const EMPTY = { nombre: '', email: '', password: '', confirmar: '' };

export function RegisterPage() {
  useDocumentTitle('Crear cuenta');
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!data.nombre.trim()) next.nombre = 'Ingresá tu nombre.';
    if (!data.email.trim()) next.email = 'Ingresá tu email.';
    else if (!/\S+@\S+\.\S+/.test(data.email)) next.email = 'Ingresá un correo electrónico válido.';
    if (data.password.length < 6) next.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (data.password !== data.confirmar) next.confirmar = 'Las contraseñas no coinciden.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await register({ nombre: data.nombre.trim(), email: data.email.trim(), password: data.password });
      navigate(location.state?.from || ROUTES.home, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <Field label={label} htmlFor={`register-${name}`} error={errors[name]}>
      <Input id={`register-${name}`} name={name} value={data[name]} onChange={handleChange} invalid={Boolean(errors[name])} {...props} />
    </Field>
  );

  return (
    <AuthLayout
      eyebrow="Nueva cuenta"
      title="Crear cuenta"
      lead="Registrate para comprar y seguir el estado de tus pedidos."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to={ROUTES.login} state={location.state} className="text-link">
            Iniciar sesión
          </Link>
        </>
      }
    >
      {error && <Alert>{error}</Alert>}
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        {field('nombre', 'Nombre', { autoComplete: 'name' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        <div className="form-grid form-grid--2">
          {field('password', 'Contraseña', { type: 'password', autoComplete: 'new-password' })}
          {field('confirmar', 'Confirmar', { type: 'password', autoComplete: 'new-password' })}
        </div>
        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
