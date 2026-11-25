import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Card, EmptyState, Spinner } from './ui';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { ROUTES } from '../config/routes';
import { ORDER_STATUS, ORDER_STATUS_FLOW } from '../config/site';
import { formatCurrency, formatDate, pluralize, shortId } from '../utils/format';

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

export function OrderHistory() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersState, setOrdersState] = useState({ loading: true, error: null });

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

  return (
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
  );
}
