import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks';
import { INVENTORY } from '../../config/site';
import { ROUTES } from '../../config/routes';
import { computeInventoryKpis, getProductId, getSku, getStockStatus, matchesProductSearch, toProductPayload } from '../../utils/inventory';
import { formatCompactCurrency, formatCurrency, formatNumber, pluralize } from '../../utils/format';
import { downloadCsv, todayStamp } from '../../utils/csv';
import { Badge, Button, Card, EmptyState, FilterTabs, Icon, PageHeader, SearchInput, StatCard } from '../../components/ui';
import { ProductThumb, SectionError, StockStatusBadge, TableSkeleton } from '../../components/admin/shared';

const FILTERS = [
  { value: 'all', label: 'Todo el stock', test: () => true },
  { value: 'alerta', label: 'Requiere reposición', test: (p) => getStockStatus(p).key !== 'ok' },
  { value: 'low', label: 'Bajo stock', test: (p) => getStockStatus(p).key === 'low' },
  { value: 'out', label: 'Sin stock', test: (p) => getStockStatus(p).key === 'out' },
  { value: 'ok', label: 'Disponible', test: (p) => getStockStatus(p).key === 'ok' }
];

export function AdminInventoryPage() {
  useDocumentTitle('Inventario');
  const { products, isLoading, error, reload, updateProduct } = useCatalog();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.some((f) => f.value === params.get('estado')) ? params.get('estado') : 'all';
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState({});
  const [savingIds, setSavingIds] = useState([]);

  const kpis = useMemo(() => computeInventoryKpis(products), [products]);

  const rows = useMemo(() => {
    const test = FILTERS.find((f) => f.value === filter).test;
    return products
      .filter((product) => test(product) && matchesProductSearch(product, search))
      .sort((a, b) => a.stock - b.stock || a.nombre.localeCompare(b.nombre));
  }, [products, filter, search]);

  const filterOptions = FILTERS.map((f) => ({ ...f, count: products.filter(f.test).length }));
  const pendingIds = Object.keys(drafts).filter((id) => {
    const product = products.find((p) => String(getProductId(p)) === id);
    return product && Number(drafts[id]) !== Number(product.stock);
  });

  const setDraft = (product, value) => {
    const id = String(getProductId(product));
    const next = Math.max(0, Math.floor(Number(value) || 0));
    setDrafts((prev) => ({ ...prev, [id]: next }));
  };

  const saveStock = async (ids) => {
    setSavingIds((prev) => [...prev, ...ids]);
    const results = await Promise.allSettled(
      ids.map((id) => {
        const product = products.find((p) => String(getProductId(p)) === id);
        return updateProduct(getProductId(product), toProductPayload(product, { stock: Number(drafts[id]) }));
      })
    );
    const failed = results.filter((r) => r.status === 'rejected');
    setDrafts((prev) => {
      const next = { ...prev };
      ids.forEach((id, index) => {
        if (results[index].status === 'fulfilled') delete next[id];
      });
      return next;
    });
    setSavingIds((prev) => prev.filter((id) => !ids.includes(id)));
    if (failed.length) notify(failed[0].reason?.message || 'No se pudo actualizar el stock.', 'danger');
    else notify(ids.length === 1 ? 'Stock actualizado.' : `Se actualizó el stock de ${ids.length} piezas.`);
  };

  const handleExport = () => {
    downloadCsv(
      `inventario-${todayStamp()}.csv`,
      [
        { label: 'SKU', value: getSku },
        { label: 'Producto', value: (p) => p.nombre },
        { label: 'Categoría', value: (p) => p.categoria },
        { label: 'Stock', value: (p) => p.stock },
        { label: 'Estado', value: (p) => getStockStatus(p).label },
        { label: 'Precio unitario', value: (p) => p.precio },
        { label: 'Valor en stock', value: (p) => p.precio * p.stock }
      ],
      rows
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Depósito · Casa taller"
        eyebrowIcon="box"
        title="Inventario"
        lead={`Ajustá las unidades disponibles de cada pieza. Con ${INVENTORY.lowStockThreshold} o menos, la pieza pasa a reposición.`}
        actions={
          <>
            <Button variant="secondary" icon="download" onClick={handleExport} disabled={rows.length === 0}>
              Exportar
            </Button>
            <Button icon="check" size="lg" disabled={pendingIds.length === 0} loading={savingIds.length > 0} onClick={() => saveStock(pendingIds)}>
              {pendingIds.length ? `Guardar ${pluralize(pendingIds.length, 'cambio')}` : 'Sin cambios'}
            </Button>
          </>
        }
      />

      {error && <SectionError message={error} onRetry={() => reload().catch(() => {})} />}

      <section className="stat-grid admin-section" aria-label="Resumen del inventario">
        <StatCard label="Unidades en depósito" icon="box" loading={isLoading} value={formatNumber(kpis.units)} caption={`Repartidas en ${pluralize(kpis.total, 'pieza')}`} />
        <StatCard label="Valor del inventario" icon="coins" tone="warning" loading={isLoading} value={formatCompactCurrency(kpis.value)} caption="Precio de lista × unidades" />
        <StatCard label="Bajo stock" icon="alert" tone="warning" loading={isLoading} value={formatNumber(kpis.low)} caption={`Entre 1 y ${INVENTORY.lowStockThreshold} unidades`} progress={kpis.total ? kpis.low / kpis.total : 0} />
        <StatCard
          label="Sin stock"
          icon="alert"
          tone="danger"
          loading={isLoading}
          value={formatNumber(kpis.out)}
          badge={kpis.out > 0 ? <Badge tone="solid-danger">Urgente</Badge> : null}
          caption="No se pueden comprar en la tienda"
          progress={kpis.total ? kpis.out / kpis.total : 0}
        />
      </section>

      <Card padded={false} className="admin-section table-card">
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar pieza o SKU…" label="Buscar en el inventario" />
          <FilterTabs
            label="Filtrar por estado"
            options={filterOptions}
            value={filter}
            onChange={(value) => setParams(value === 'all' ? {} : { estado: value }, { replace: true })}
          />
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Pieza</th>
                <th scope="col">Estado</th>
                <th scope="col" className="is-numeric">Precio unit.</th>
                <th scope="col">Unidades</th>
                <th scope="col" className="is-numeric">Valor en stock</th>
                <th scope="col" className="is-actions">Acción</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon="check" title="Nada para mostrar con este filtro">
                        {filter === 'alerta' ? 'Ninguna pieza necesita reposición.' : 'Probá con otro filtro o búsqueda.'}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  rows.map((product) => {
                    const id = String(getProductId(product));
                    const draft = drafts[id] ?? product.stock;
                    const dirty = Number(draft) !== Number(product.stock);
                    const saving = savingIds.includes(id);
                    return (
                      <tr key={id} className={dirty ? 'is-dirty' : undefined}>
                        <td>
                          <div className="cell-product">
                            <ProductThumb product={product} />
                            <div>
                              <Link to={ROUTES.product(id)} className="cell-title cell-link">{product.nombre}</Link>
                              <p className="cell-sub">{getSku(product)} · {product.categoria}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <StockStatusBadge product={{ ...product, stock: draft }} />
                        </td>
                        <td className="is-numeric">{formatCurrency(product.precio)}</td>
                        <td>
                          <div className="quantity-stepper quantity-stepper--sm">
                            <button type="button" onClick={() => setDraft(product, draft - 1)} disabled={draft <= 0 || saving} aria-label={`Restar una unidad a ${product.nombre}`}>
                              <Icon name="minus" size={14} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={draft}
                              disabled={saving}
                              onChange={(e) => setDraft(product, e.target.value)}
                              aria-label={`Unidades de ${product.nombre}`}
                            />
                            <button type="button" onClick={() => setDraft(product, draft + 1)} disabled={saving} aria-label={`Sumar una unidad a ${product.nombre}`}>
                              <Icon name="plus" size={14} />
                            </button>
                          </div>
                          {dirty && <span className="cell-sub stock-diff">antes {product.stock}</span>}
                        </td>
                        <td className="is-numeric">{formatCurrency(product.precio * draft)}</td>
                        <td className="is-actions">
                          <Button variant={dirty ? 'primary' : 'outline'} size="sm" disabled={!dirty} loading={saving} onClick={() => saveStock([id])}>
                            {saving ? 'Guardando' : 'Guardar'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
      </Card>
    </>
  );
}
