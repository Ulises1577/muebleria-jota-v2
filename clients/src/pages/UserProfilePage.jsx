import React, { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const ORDERS_KEY_PREFIX = 'hermanos_jota_orders_';

const formatPrice = (value) => Number(value || 0).toLocaleString('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString('es-AR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

export const UserProfilePage = ({ user, onUserUpdate, onLogout, onNavigate }) => {
  const userId = user?._id || user?.id;
  const extras = userId ? authService.getLocalProfileExtras(userId) : { telefono: '', direccion: '' };

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || extras.telefono || '',
    direccion: user?.direccion || extras.direccion || ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const localExtras = userId ? authService.getLocalProfileExtras(userId) : { telefono: '', direccion: '' };
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || localExtras.telefono || '',
      direccion: user?.direccion || localExtras.direccion || ''
    });
  }, [user, userId]);

  const orders = useMemo(() => {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(`${ORDERS_KEY_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [userId, toastMessage]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.direccion.trim()) nextErrors.direccion = 'La dirección de despacho es necesaria para calcular fletes.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      });
      authService.saveLocalProfileExtras(userId, {
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      });
      onUserUpdate(updatedUser);
      showToast('Tus datos de contacto y despacho se guardaron.');
    } catch (error) {
      authService.saveLocalProfileExtras(userId, {
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      });
      onUserUpdate({
        ...user,
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      });
      showToast(error.message || 'Guardamos tus datos de despacho en este dispositivo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuote = () => {
    onNavigate('contact', {
      nombre: formData.nombre,
      email: formData.email,
      mensaje: `Hola, soy ${formData.nombre}. Me gustaría una cotización a medida.${formData.direccion ? ` Dirección de despacho: ${formData.direccion}.` : ''}`
    });
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="contenedor">
          <p className="eyebrow">Cuenta cliente</p>
          <h1>Mi perfil</h1>
          <p className="profile-hero__texto">
            Bienvenido al taller, {user?.nombre}. Acá están tus datos de despacho, el historial de pedidos y el acceso a cotizaciones a medida.
          </p>
        </div>
      </section>

      <section className="profile-main">
        <div className="contenedor profile-grid">
          <article className="profile-card">
            <span className="esquina esquina--tl" aria-hidden="true"></span>
            <span className="esquina esquina--tr" aria-hidden="true"></span>
            <h2>Datos de contacto y despacho</h2>
            <p className="profile-card__lead">Usamos la dirección para el cálculo de fletes de cada pieza.</p>
            <form onSubmit={handleSave} noValidate>
              <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
                <label htmlFor="perfil-nombre">Nombre</label>
                <input id="perfil-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} />
                <span className="mensaje-error">{errors.nombre || ''}</span>
              </div>
              <div className="campo">
                <label htmlFor="perfil-email">Email</label>
                <input id="perfil-email" name="email" type="email" value={formData.email} readOnly />
              </div>
              <div className="campo">
                <label htmlFor="perfil-telefono">Teléfono</label>
                <input id="perfil-telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} />
              </div>
              <div className={`campo ${errors.direccion ? 'con-error' : ''}`}>
                <label htmlFor="perfil-direccion">Dirección de despacho</label>
                <textarea id="perfil-direccion" name="direccion" rows="3" value={formData.direccion} onChange={handleChange} />
                <span className="mensaje-error">{errors.direccion || ''}</span>
              </div>
              <button type="submit" className="boton-enviar" disabled={isSaving}>
                {isSaving ? 'Guardando…' : 'Guardar datos'}
              </button>
            </form>
          </article>

          <div className="profile-side">
            <article className="profile-card">
              <h2>Historial de pedidos</h2>
              {orders.length === 0 ? (
                <p className="profile-empty">Todavía no hay compras ni consultas registradas desde el carrito.</p>
              ) : (
                <ul className="profile-orders">
                  {orders.map((order) => (
                    <li key={order.id} className="profile-order">
                      <div>
                        <strong>Pedido {order.id}</strong>
                        <span>{formatDate(order.date)}</span>
                      </div>
                      <p>{order.items.map((item) => `${item.nombre} × ${item.quantity}`).join(' · ')}</p>
                      <em>{formatPrice(order.total)}</em>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="profile-card">
              <h2>Favoritos / Cotización</h2>
              <p className="profile-card__lead">
                Pedí una cotización a medida con tus datos ya completos: nombre, email y dirección de despacho.
              </p>
              <button type="button" className="home-button" onClick={handleQuote}>
                Solicitar cotización
              </button>
            </article>

            <button type="button" className="home-button home-button--ghost profile-logout" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>

      {toastMessage && (
        <div className="toast-container" aria-live="polite">
          <div className="custom-toast" style={{
            backgroundColor: 'var(--siena-tostado)',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000
          }}>
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  );
};
