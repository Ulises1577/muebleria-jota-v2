import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, EmptyState, Field, Input, PageHeader, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks';
import { orderService } from '../services/orderService';
import { ROUTES } from '../config/routes';
import { ORDER_STATUS, ORDER_STATUS_FLOW } from '../config/site';
import { formatCurrency, formatDate, getInitials, pluralize, shortId } from '../utils/format';

function OrderTimeline({ estado }) {
  const current = ORDER_STATUS_FLOW.indexOf(estado);
  return (
    <ol className="order-timeline" aria-label="Estado del pedido">
      {ORDER_STATUS_FLOW.map((key, index) => (
        <li key={key} className={index <= current ? 'is-done' : undefined} aria-current={index === current ? 'step' : undefined}>
          {ORDER_STATUS[key].label}
        </li>
      ))}
    </ol>
  );
}

export function UserProfilePage() {
  useDocumentTitle('Mi cuenta');
  const { user, isAdmin, updateProfile, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: user.nombre || '', telefono: user.telefono || '', direccion: user.direccion || '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersState, setOrdersState] = useState({ loading: true, error: null });

  useEffect(() => {
    setForm({ nombre: user.nombre || '', telefono: user.telefono || '', direccion: user.direccion || '' });
  }, [user]);

  useEffect(() => {
    let active = true;
    orderService
      .getMyOrders()
      .then((data) => active && (setOrders(data), setOrdersState({ loading: false, error: null })))
      .catch((err) => active && setOrdersState({ loading: false, error: err.message }));
    return () => {
      active = false;
    };
  }, []);

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

        <Card as="section" aria-labelledby="orders-title">
          <div className="section-heading section-heading--compact">
            <h2 id="orders-title" className="section-title">Mis pedidos</h2>
            {!ordersState.loading && <span className="text-muted">{pluralize(orders.length, 'pedido')}</span>}
          </div>

          {ordersState.loading ? (
            <div className="center-block"><Spinner label="Cargando pedidos" /></div>
          ) : ordersState.error ? (
            <Alert>{ordersState.error}</Alert>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="Todavía no hiciste pedidos"
              action={!isAdmin && <Link to={ROUTES.catalog} className="btn btn--outline btn--md"><span>Ver catálogo</span></Link>}
            >
              Cuando confirmes una compra vas a poder seguir su estado desde acá.
            </EmptyState>
          ) : (
            <ul className="order-list">
              {orders.map((order) => {
                const meta = ORDER_STATUS[order.estado] || { label: order.estado, tone: 'neutral' };
                return (
                  <li key={order._id} className="order-card">
                    <header className="order-card__header">
                      <div>
                        <p className="cell-title">Pedido #{shortId(order._id)}</p>
                        <p className="cell-sub">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge tone={meta.tone} dot>{meta.label}</Badge>
                    </header>
                    <OrderTimeline estado={order.estado} />
                    <ul className="order-card__items">
                      {(order.items || []).map((item) => (
                        <li key={item.productoId + item.nombre}>
                          <span>{item.cantidad} × {item.nombre}</span>
                          <span>{formatCurrency(item.precio * item.cantidad)}</span>
                        </li>
                      ))}
                    </ul>
                    <footer className="order-card__footer">
                      <span className="text-muted">{order.datosEnvio?.direccion || 'Entrega a coordinar'}</span>
                      <strong>{formatCurrency(order.total)}</strong>
                    </footer>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
