import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { ROUTES } from '../config/routes';
import { COMMERCE } from '../config/site';
import { formatCurrency, pluralize, shortId } from '../utils/format';
import { getProductId } from '../utils/inventory';
import { Alert, Button, EmptyState, Field, Icon, IconButton, Input, Modal, Textarea } from './ui';

const emptyShipping = (user) => ({
  direccion: user?.direccion || '',
  telefono: user?.telefono || '',
  notas: ''
});

export function CartDrawer() {
  const cart = useCart();
  const { user, updateProfile } = useAuth();
  const { reload } = useCatalog();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('cart');
  const [shipping, setShipping] = useState(() => emptyShipping(user));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cart.isOpen) {
      setStep('cart');
      setSubmitError('');
      setErrors({});
      setShipping(emptyShipping(user));
    }
  }, [cart.isOpen, user]);

  const goToLogin = () => {
    cart.close();
    navigate(ROUTES.login, { state: { from: location.pathname, reason: 'checkout' } });
  };

  const handleShippingChange = (event) => {
    const { name, value } = event.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!shipping.direccion.trim()) nextErrors.direccion = 'Indicá la dirección de entrega.';
    if (!shipping.telefono.trim()) nextErrors.telefono = 'Dejanos un teléfono para coordinar el envío.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const order = await orderService.createOrder({
        items: cart.items,
        datosEnvio: {
          direccion: shipping.direccion.trim(),
          telefono: shipping.telefono.trim(),
          notas: shipping.notas.trim()
        }
      });
      cart.clear();
      cart.close();
      // Si la cuenta todavía no tenía datos de entrega, se guardan para la próxima compra
      if (!user?.direccion || !user?.telefono) {
        updateProfile({
          nombre: user.nombre,
          direccion: user.direccion || shipping.direccion.trim(),
          telefono: user.telefono || shipping.telefono.trim()
        }).catch(() => {});
      }
      reload().catch(() => {});
      notify(`Pedido #${shortId(order?._id)} confirmado. El taller te contactará para coordinar la entrega.`);
    } catch (error) {
      setSubmitError(error.message);
      // Si el problema fue el stock, se refresca el catálogo para mostrar las unidades reales
      if (error.status === 409) reload().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const isEmpty = cart.items.length === 0;

  const footer = isEmpty ? null : step === 'cart' ? (
    <div className="cart-summary">
      <div className="cart-summary__row">
        <span>Total estimado</span>
        <strong>{formatCurrency(cart.total)}</strong>
      </div>
      <p className="cart-summary__note">Hasta {COMMERCE.installments} cuotas sin interés · envío a coordinar</p>
      <div className="cart-summary__actions">
        <Button variant="secondary" onClick={cart.clear}>
          Vaciar
        </Button>
        {user ? (
          <Button onClick={() => setStep('checkout')} iconRight="arrow-right">
            Finalizar compra
          </Button>
        ) : (
          <Button onClick={goToLogin} icon="user">
            Ingresar para comprar
          </Button>
        )}
      </div>
    </div>
  ) : (
    <div className="cart-summary">
      <div className="cart-summary__row">
        <span>Total del pedido</span>
        <strong>{formatCurrency(cart.total)}</strong>
      </div>
      <div className="cart-summary__actions">
        <Button variant="secondary" icon="arrow-left" onClick={() => setStep('cart')} disabled={submitting}>
          Volver
        </Button>
        <Button type="submit" form="checkout-form" loading={submitting}>
          {submitting ? 'Confirmando…' : 'Confirmar pedido'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={cart.isOpen}
      onClose={cart.close}
      variant="drawer"
      eyebrow={isEmpty ? 'Sin artículos' : pluralize(cart.count, 'producto')}
      title={step === 'checkout' ? 'Datos de entrega' : 'Tu carrito'}
      footer={footer}
    >
      {isEmpty ? (
        <EmptyState
          icon="cart"
          title="Tu carrito está vacío"
          action={
            <Link to={ROUTES.catalog} className="btn btn--outline btn--md" onClick={cart.close}>
              <span>Explorar colección</span>
            </Link>
          }
        >
          Elegí una pieza del catálogo y aparecerá acá.
        </EmptyState>
      ) : step === 'cart' ? (
        <ul className="cart-list">
          {cart.items.map((item) => {
            const id = getProductId(item);
            const max = cart.maxUnitsFor(item);
            return (
              <li key={id} className="cart-item">
                <img src={item.imagenUrl} alt="" className="thumb thumb--lg" />
                <div className="cart-item__body">
                  <Link to={ROUTES.product(id)} className="cart-item__title" onClick={cart.close}>
                    {item.nombre}
                  </Link>
                  <span className="cart-item__price">{formatCurrency(item.precio * item.quantity)}</span>
                  <div className="cart-item__controls">
                    <div className="quantity-stepper quantity-stepper--sm">
                      <button type="button" onClick={() => cart.updateQuantity(id, item.quantity - 1)} aria-label={`Quitar una unidad de ${item.nombre}`}>
                        <Icon name="minus" size={14} />
                      </button>
                      <input type="number" value={item.quantity} readOnly aria-label={`Cantidad de ${item.nombre}`} />
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(id, item.quantity + 1)}
                        disabled={item.quantity >= max}
                        aria-label={`Sumar una unidad de ${item.nombre}`}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                    <IconButton icon="trash" label={`Quitar ${item.nombre}`} variant="danger" size="sm" onClick={() => cart.removeItem(id)} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <form id="checkout-form" className="form-grid" onSubmit={handleConfirm} noValidate>
          {submitError && <Alert>{submitError}</Alert>}
          <p className="text-muted">
            Pedido a nombre de <strong>{user?.nombre}</strong> ({user?.email}).
          </p>
          <Field label="Dirección de entrega" htmlFor="checkout-direccion" error={errors.direccion}>
            <Input id="checkout-direccion" name="direccion" autoComplete="street-address" value={shipping.direccion} onChange={handleShippingChange} invalid={Boolean(errors.direccion)} />
          </Field>
          <Field label="Teléfono" htmlFor="checkout-telefono" error={errors.telefono}>
            <Input id="checkout-telefono" name="telefono" type="tel" autoComplete="tel" value={shipping.telefono} onChange={handleShippingChange} invalid={Boolean(errors.telefono)} />
          </Field>
          <Field label="Notas para el taller (opcional)" htmlFor="checkout-notas">
            <Textarea id="checkout-notas" name="notas" rows={3} value={shipping.notas} onChange={handleShippingChange} />
          </Field>
          <ul className="checkout-lines">
            {cart.items.map((item) => (
              <li key={getProductId(item)}>
                <span>
                  {item.quantity} × {item.nombre}
                </span>
                <span>{formatCurrency(item.precio * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </form>
      )}
    </Modal>
  );
}
