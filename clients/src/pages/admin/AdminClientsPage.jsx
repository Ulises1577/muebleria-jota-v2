import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDocumentTitle } from '../../hooks';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import { ADMIN } from '../../config/site';
import { formatCompactCurrency, formatCurrency, formatDate, formatNumber, getInitials, normalizeText, pluralize } from '../../utils/format';
import { downloadCsv, todayStamp } from '../../utils/csv';
import { Badge, Button, Card, EmptyState, FilterTabs, PageHeader, Pagination, SearchInput, StatCard } from '../../components/ui';
import { SectionError, TableSkeleton } from '../../components/admin/shared';

export function AdminClientsPage() {
  useDocumentTitle('Clientes');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = ADMIN.pageSizeOptions[1];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, orderList] = await Promise.all([userService.getUsers(), orderService.getAllOrders()]);
      setUsers(userList);
      setOrders(orderList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [search, segment]);

  // Cada cuenta se cruza con sus pedidos para mostrar compras y facturación reales
  const clients = useMemo(() => {
    const byUser = new Map();
    orders.forEach((order) => {
      const key = String(order.usuarioId);
      const entry = byUser.get(key) || { count: 0, spent: 0, last: null };
      entry.count += 1;
      entry.spent += Number(order.total || 0);
      if (!entry.last || new Date(order.createdAt) > new Date(entry.last)) entry.last = order.createdAt;
      byUser.set(key, entry);
    });
    return users.map((user) => ({ ...user, ...(byUser.get(String(user._id)) || { count: 0, spent: 0, last: null }) }));
  }, [users, orders]);

  const stats = useMemo(() => {
    const customers = clients.filter((c) => !c.isAdmin);
    const buyers = customers.filter((c) => c.count > 0);
    const spent = buyers.reduce((acc, c) => acc + c.spent, 0);
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      customers: customers.length,
      buyers: buyers.length,
      admins: clients.length - customers.length,
      recent: customers.filter((c) => new Date(c.createdAt).getTime() >= monthAgo).length,
      lifetime: buyers.length ? spent / buyers.length : 0,
      conversion: customers.length ? buyers.length / customers.length : 0
    };
  }, [clients]);

  const segments = [
    { value: 'all', label: 'Todas las cuentas', test: () => true },
    { value: 'buyers', label: 'Con compras', test: (c) => c.count > 0 },
    { value: 'leads', label: 'Sin compras', test: (c) => c.count === 0 && !c.isAdmin },
    { value: 'admins', label: 'Administradores', test: (c) => c.isAdmin }
  ];

  const filtered = useMemo(() => {
    const test = segments.find((s) => s.value === segment).test;
    const needle = normalizeText(search);
    return clients
      .filter((c) => test(c) && (!needle || normalizeText(`${c.nombre} ${c.email} ${c.telefono || ''}`).includes(needle)))
      .sort((a, b) => b.spent - a.spent || new Date(b.createdAt) - new Date(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, search, segment]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () =>
    downloadCsv(
      `clientes-${todayStamp()}.csv`,
      [
        { label: 'Nombre', value: (c) => c.nombre },
        { label: 'Email', value: (c) => c.email },
        { label: 'Teléfono', value: (c) => c.telefono },
        { label: 'Dirección', value: (c) => c.direccion },
        { label: 'Rol', value: (c) => (c.isAdmin ? 'Administrador' : 'Cliente') },
        { label: 'Alta', value: (c) => c.createdAt },
        { label: 'Pedidos', value: (c) => c.count },
        { label: 'Total comprado', value: (c) => c.spent }
      ],
      filtered
    );

  return (
    <>
      <PageHeader
        eyebrow="Comunidad · Cuentas registradas"
        eyebrowIcon="users"
        title="Clientes"
        lead="Quiénes compran en la casa, cuánto y cuándo fue su último pedido."
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

      <section className="stat-grid admin-section" aria-label="Resumen de clientes">
        <StatCard label="Clientes registrados" icon="users" loading={loading} value={formatNumber(stats.customers)} caption={`${pluralize(stats.recent, 'alta', 'altas')} en los últimos 30 días`} />
        <StatCard
          label="Compradores"
          icon="cart"
          tone="success"
          loading={loading}
          value={formatNumber(stats.buyers)}
          caption={`${Math.round(stats.conversion * 100)}% de las cuentas compró`}
          progress={stats.conversion}
        />
        <StatCard label="Valor por comprador" icon="coins" tone="warning" loading={loading} value={formatCompactCurrency(stats.lifetime)} caption="Promedio facturado por cliente" />
        <StatCard label="Administradores" icon="shield" tone="danger" loading={loading} value={formatNumber(stats.admins)} caption="Cuentas con acceso al panel" />
      </section>

      <Card padded={false} className="admin-section table-card">
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o teléfono…" label="Buscar clientes" />
          <FilterTabs label="Segmento" options={segments.map((s) => ({ ...s, count: clients.filter(s.test).length }))} value={segment} onChange={setSegment} />
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Contacto</th>
                <th scope="col">Rol</th>
                <th scope="col">Alta</th>
                <th scope="col" className="is-numeric">Pedidos</th>
                <th scope="col" className="is-numeric">Total comprado</th>
                <th scope="col">Último pedido</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState icon="users" title="No hay cuentas para mostrar">
                        Probá con otro segmento o búsqueda.
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <div className="cell-product">
                          <span className="avatar avatar--soft" aria-hidden="true">{getInitials(client.nombre)}</span>
                          <div>
                            <p className="cell-title">{client.nombre}</p>
                            <p className="cell-sub">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p>{client.telefono || <span className="text-muted">Sin teléfono</span>}</p>
                        <p className="cell-sub">{client.direccion || 'Sin dirección'}</p>
                      </td>
                      <td>
                        <Badge tone={client.isAdmin ? 'danger' : 'primary'}>{client.isAdmin ? 'Administrador' : 'Cliente'}</Badge>
                      </td>
                      <td className="nowrap">{formatDate(client.createdAt)}</td>
                      <td className="is-numeric">{formatNumber(client.count)}</td>
                      <td className="is-numeric">
                        <strong>{formatCurrency(client.spent)}</strong>
                      </td>
                      <td className="nowrap">{client.last ? formatDate(client.last) : <span className="text-muted">—</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
        <div className="table-footer">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} itemLabel="cuentas" />
        </div>
      </Card>
    </>
  );
}
