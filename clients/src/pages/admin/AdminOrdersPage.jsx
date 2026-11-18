import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useDocumentTitle } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { ADMIN, ORDER_STATUS, ORDER_STATUS_FLOW } from '../../config/site';
import { formatCompactCurrency, formatCurrency, formatDateTime, formatNumber, normalizeText, pluralize, shortId } from '../../utils/format';
import { downloadCsv, todayStamp } from '../../utils/csv';
import { Badge, Button, Card, EmptyState, FilterTabs, IconButton, PageHeader, Pagination, SearchInput, Select, StatCard } from '../../components/ui';
import { SectionError, TableSkeleton } from '../../components/admin/shared';

const itemsCount = (order) => (order.items || []).reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

export function AdminOrdersPage() {
  useDocumentTitle('Pedidos');
  const { notify } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = ADMIN.pageSizeOptions[1];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await orderService.getAllOrders());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [status, search]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);
    const toShip = orders.filter((order) => order.estado === 'pendiente' || order.estado === 'confirmado').length;
    const delivered = orders.filter((order) => order.estado === 'entregado').length;
    return {
      revenue,
      toShip,
      delivered,
      average: orders.length ? revenue / orders.length : 0,
      customers: new Set(orders.map((order) => order.usuarioEmail)).size
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = normalizeText(search);
    return orders.filter(
      (order) =>
        (status === 'all' || order.estado === status) &&
        (!needle ||
          normalizeText(order.usuarioEmail).includes(needle) ||
          normalizeText(shortId(order._id)).includes(needle) ||
          (order.items || []).some((item) => normalizeText(item.nombre).includes(needle)))
    );
  }, [orders, status, search]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statusOptions = [
    { value: 'all', label: 'Todos', count: orders.length },
    ...ORDER_STATUS_FLOW.map((key) => ({ value: key, label: ORDER_STATUS[key].label, count: orders.filter((o) => o.estado === key).length }))
  ];

  const changeStatus = async (order, estado) => {
    setUpdating(order._id);
    try {
      const updated = await orderService.updateStatus(order._id, estado);
      setOrders((prev) => prev.map((item) => (item._id === order._id ? { ...item, ...updated } : item)));
      notify(`Pedido #${shortId(order._id)} marcado como ${ORDER_STATUS[estado].label.toLowerCase()}.`);
    } catch (err) {
      notify(err.message, 'danger');
    } finally {
      setUpdating(null);
    }
  };

  const handleExport = () => {
    downloadCsv(
      `pedidos-${todayStamp()}.csv`,
      [
        { label: 'Pedido', value: (o) => shortId(o._id) },
        { label: 'Fecha', value: (o) => o.createdAt },
        { label: 'Cliente', value: (o) => o.usuarioEmail },
        { label: 'Unidades', value: itemsCount },
        { label: 'Detalle', value: (o) => (o.items || []).map((i) => `${i.cantidad}x ${i.nombre}`).join(' | ') },
        { label: 'Total', value: (o) => o.total },
        { label: 'Estado', value: (o) => ORDER_STATUS[o.estado]?.label || o.estado },
        { label: 'Dirección', value: (o) => o.datosEnvio?.direccion },
        { label: 'Teléfono', value: (o) => o.datosEnvio?.telefono }
      ],
      filtered
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Ventas · Órdenes de taller"
        eyebrowIcon="receipt"
        title="Pedidos"
        lead="Seguimiento de cada compra de la tienda: preparación, despacho y entrega."
        actions={
          <>
            <Button variant="secondary" icon="refresh" onClick={load} disabled={loading}>
              Actualizar
            </Button>
            <Button variant="secondary" icon="download" onClick={handleExport} disabled={filtered.length === 0}>
              Exportar
            </Button>
          </>
        }
      />

      {error && <SectionError message={error} onRetry={load} />}

      <section className="stat-grid admin-section" aria-label="Resumen de ventas">
        <StatCard label="Pedidos" icon="receipt" loading={loading} value={formatNumber(orders.length)} caption={`De ${pluralize(stats.customers, 'cliente')}`} />
        <StatCard label="Facturación" icon="coins" tone="warning" loading={loading} value={formatCompactCurrency(stats.revenue)} caption={`Ticket promedio ${formatCurrency(stats.average)}`} />
        <StatCard
          label="Por despachar"
          icon="truck"
          tone="danger"
          loading={loading}
          value={formatNumber(stats.toShip)}
          caption="Pendientes o confirmados"
          progress={orders.length ? stats.toShip / orders.length : 0}
        />
        <StatCard
          label="Entregados"
          icon="check"
          tone="success"
          loading={loading}
          value={formatNumber(stats.delivered)}
          caption="Pedidos cerrados"
          progress={orders.length ? stats.delivered / orders.length : 0}
        />
      </section>

      <Card padded={false} className="admin-section table-card">
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, nº de pedido o pieza…" label="Buscar pedidos" />
          <FilterTabs label="Filtrar por estado" options={statusOptions} value={status} onChange={setStatus} />
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" aria-label="Detalle" />
                <th scope="col">Pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Piezas</th>
                <th scope="col" className="is-numeric">Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : (
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon="receipt" title={orders.length ? 'Ningún pedido coincide con el filtro' : 'Todavía no hay pedidos'}>
                        {orders.length ? 'Probá con otro estado o búsqueda.' : 'Cuando un cliente finalice una compra en la tienda, va a aparecer acá.'}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((order) => {
                    const isOpen = expanded === order._id;
                    const meta = ORDER_STATUS[order.estado] || { label: order.estado, tone: 'neutral' };
                    return (
                      <Fragment key={order._id}>
                        <tr className={isOpen ? 'is-expanded' : undefined}>
                          <td className="is-actions">
                            <IconButton
                              icon={isOpen ? 'chevron-down' : 'chevron-right'}
                              size="sm"
                              label={isOpen ? 'Ocultar detalle' : 'Ver detalle'}
                              aria-expanded={isOpen}
                              onClick={() => setExpanded(isOpen ? null : order._id)}
                            />
                          </td>
                          <td>
                            <p className="cell-title">#{shortId(order._id)}</p>
                            <p className="cell-sub">{formatDateTime(order.createdAt)}</p>
                          </td>
                          <td>{order.usuarioEmail}</td>
                          <td>
                            {pluralize(itemsCount(order), 'unidad', 'unidades')}
                            <p className="cell-sub">{pluralize((order.items || []).length, 'producto')}</p>
                          </td>
                          <td className="is-numeric">
                            <strong>{formatCurrency(order.total)}</strong>
                          </td>
                          <td>
                            <div className="order-status">
                              <Badge tone={meta.tone} dot>{meta.label}</Badge>
                              <Select
                                value={order.estado}
                                disabled={updating === order._id}
                                onChange={(e) => changeStatus(order, e.target.value)}
                                aria-label={`Cambiar estado del pedido ${shortId(order._id)}`}
                              >
                                {ORDER_STATUS_FLOW.map((key) => (
                                  <option key={key} value={key}>{ORDER_STATUS[key].label}</option>
                                ))}
                              </Select>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="order-detail-row">
                            <td colSpan={6}>
                              <div className="order-detail">
                                <ul className="order-detail__items">
                                  {(order.items || []).map((item) => (
                                    <li key={item.productoId + item.nombre}>
                                      {item.imagenUrl ? <img className="thumb" src={item.imagenUrl} alt="" /> : <span className="thumb thumb--empty" />}
                                      <span className="order-detail__name">{item.nombre}</span>
                                      <span className="text-muted">{item.cantidad} × {formatCurrency(item.precio)}</span>
                                      <strong>{formatCurrency(item.cantidad * item.precio)}</strong>
                                    </li>
                                  ))}
                                </ul>
                                <dl className="order-detail__shipping">
                                  <div><dt>Dirección</dt><dd>{order.datosEnvio?.direccion || 'Sin informar'}</dd></div>
                                  <div><dt>Teléfono</dt><dd>{order.datosEnvio?.telefono || 'Sin informar'}</dd></div>
                                  <div><dt>Notas</dt><dd>{order.datosEnvio?.notas || '—'}</dd></div>
                                  <div><dt>Última actualización</dt><dd>{formatDateTime(order.updatedAt)}</dd></div>
                                </dl>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
        <div className="table-footer">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} itemLabel="pedidos" />
        </div>
      </Card>
    </>
  );
}
