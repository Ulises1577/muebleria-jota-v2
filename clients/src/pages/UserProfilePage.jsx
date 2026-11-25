import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Field, Input, PageHeader } from '../components/ui';
import { OrderHistory } from '../components/OrderHistory';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks';
import { ROUTES } from '../config/routes';
import { getInitials } from '../utils/format';

export function UserProfilePage() {
  useDocumentTitle('Mi cuenta');
  const { user, isAdmin, updateProfile, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: user.nombre || '', telefono: user.telefono || '', direccion: user.direccion || '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  useEffect(() => {
    setForm({ nombre: user.nombre || '', telefono: user.telefono || '', direccion: user.direccion || '' });
  }, [user]);

  const dirty = ['nombre', 'telefono', 'direccion'].some((key) => (form[key] || '') !== (user[key] || ''));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await updateProfile(form);
      notify('Guardamos tus datos.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  return (
    <div className="container store-page">
      <PageHeader
        eyebrow={isAdmin ? 'Cuenta de administración' : 'Mi cuenta'}
        eyebrowIcon="user"
        title={`Hola, ${user.nombre?.split(' ')[0] || 'cliente'}`}
        lead={isAdmin ? 'Tus datos de acceso al panel del taller.' : 'Tus datos de entrega y el seguimiento de cada pedido.'}
        actions={
          <Button variant="secondary" icon="logout" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        }
      />

      <div className="profile-layout">
        <Card as="section" aria-labelledby="profile-data-title">
          <div className="profile-id">
            <span className="avatar avatar--lg" aria-hidden="true">{getInitials(user.nombre)}</span>
            <div>
              <h2 id="profile-data-title" className="section-title">{user.nombre}</h2>
              <p className="text-muted">{user.email}</p>
              <Badge tone={isAdmin ? 'danger' : 'primary'}>{isAdmin ? 'Administrador' : 'Cliente'}</Badge>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit} noValidate>
            {formError && <Alert>{formError}</Alert>}
            <Field label="Nombre" htmlFor="perfil-nombre">
              <Input id="perfil-nombre" name="nombre" autoComplete="name" value={form.nombre} onChange={handleChange} />
            </Field>
            <Field label="Teléfono" htmlFor="perfil-telefono" hint="Lo usamos para coordinar la entrega.">
              <Input id="perfil-telefono" name="telefono" type="tel" autoComplete="tel" value={form.telefono} onChange={handleChange} />
            </Field>
            <Field label="Dirección de entrega" htmlFor="perfil-direccion" hint="Precarga el checkout. Si está vacía, se guarda la de tu primera compra.">
              <Input id="perfil-direccion" name="direccion" autoComplete="street-address" value={form.direccion} onChange={handleChange} />
            </Field>
            <div className="form-actions">
              <Button type="submit" loading={saving} disabled={!dirty}>
                {saving ? 'Guardando…' : 'Guardar datos'}
              </Button>
            </div>
          </form>
        </Card>

        <OrderHistory />
      </div>
    </div>
  );
}
