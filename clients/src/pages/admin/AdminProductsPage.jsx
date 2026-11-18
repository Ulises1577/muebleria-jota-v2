import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle, useLocalStorage } from '../../hooks';
import { ADMIN, INVENTORY, STORAGE_KEYS } from '../../config/site';
import { ROUTES } from '../../config/routes';
import {
  computeInventoryKpis,
  getCategories,
  getProductId,
  getSku,
  getStockStatus,
  matchesProductSearch,
  STOCK_STATUS
} from '../../utils/inventory';
import { formatCompactCurrency, formatCurrency, formatNumber, formatPercent, pluralize } from '../../utils/format';
import { downloadCsv, todayStamp } from '../../utils/csv';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  FilterTabs,
  Icon,
  IconButton,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  StatCard
} from '../../components/ui';
import { ProductForm } from '../../components/admin/ProductForm';
import { ColumnMenu, ProductThumb, SectionError, StockPill, StockStatusBadge, TableSkeleton } from '../../components/admin/shared';

const COLUMNS = [
  { key: 'imagen', label: 'Imagen' },
  { key: 'nombre', label: 'Nombre y SKU', locked: true },
  { key: 'categoria', label: 'Categoría' },
  { key: 'precio', label: 'Precio (ARS)' },
  { key: 'stock', label: 'Stock' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', locked: true }
];

const EXPORT_COLUMNS = [
  { label: 'SKU', value: getSku },
  { label: 'Nombre', value: (p) => p.nombre },
  { label: 'Categoría', value: (p) => p.categoria },
  { label: 'Precio', value: (p) => p.precio },
  { label: 'Stock', value: (p) => p.stock },
  { label: 'Estado', value: (p) => getStockStatus(p).label },
  { label: 'Valor en stock', value: (p) => p.precio * p.stock },
  { label: 'Descripción', value: (p) => p.descripcion },
  { label: 'Imagen', value: (p) => p.imagenUrl }
];

export function AdminProductsPage() {
  useDocumentTitle('Gestión de productos');
  const { products, isLoading, error, reload, createProduct, updateProduct, deleteProduct } = useCatalog();
  const { notify } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage(STORAGE_KEYS.adminPageSize, ADMIN.defaultPageSize);
  const [visibleColumns, setVisibleColumns] = useLocalStorage(STORAGE_KEYS.adminColumns, COLUMNS.map((c) => c.key));

  const [editor, setEditor] = useState({ open: false, product: null });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // "Editar producto" desde la ficha pública llega con el id en el estado de navegación
  const editId = location.state?.editProductId;
  useEffect(() => {
    if (!editId || products.length === 0) return;
    const target = products.find((product) => String(getProductId(product)) === String(editId));
    if (target) setEditor({ open: true, product: target });
    navigate(location.pathname, { replace: true, state: null });
  }, [editId, products, navigate, location.pathname]);

  useEffect(() => setPage(1), [search, category, status, pageSize]);

  const kpis = useMemo(() => computeInventoryKpis(products), [products]);
  const categories = useMemo(() => getCategories(products), [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesProductSearch(product, search) &&
          (category === 'all' || product.categoria === category) &&
          (status === 'all' || getStockStatus(product).key === status)
      ),
    [products, search, category, status]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const show = (key) => COLUMNS.find((c) => c.key === key)?.locked || visibleColumns.includes(key);
  const visibleCount = COLUMNS.filter((c) => show(c.key)).length;

  const categoryOptions = [
    { value: 'all', label: 'Todos', count: products.length },
    ...categories.map((c) => ({ value: c.name, label: c.name, count: c.count }))
  ];

  const handleSave = async (payload) => {
    if (editor.product) {
      const updated = await updateProduct(getProductId(editor.product), payload);
      notify(`Se actualizó ${updated?.nombre || payload.nombre}.`);
    } else {
      const created = await createProduct(payload);
      notify(`Se agregó ${created?.nombre || payload.nombre} al catálogo.`);
    }
    setEditor({ open: false, product: null });
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(getProductId(toDelete));
      notify(`Se eliminó ${toDelete.nombre} del catálogo.`);
      setToDelete(null);
    } catch (err) {
      notify(err.message || 'No se pudo eliminar el producto.', 'danger');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    downloadCsv(`productos-${todayStamp()}.csv`, EXPORT_COLUMNS, filtered);
    notify(`Se exportaron ${pluralize(filtered.length, 'producto')}.`, 'info');
  };

  const hasFilters = search || category !== 'all' || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
  };

  return (
    <>
      <PageHeader
        eyebrow="Catálogo maestro · Casa taller"
        eyebrowIcon="layers"
        title="Gestión de productos"
        lead="Control de inventario, piezas de ebanistería y catálogo editorial de la casa."
        actions={
          <>
            <div className="page-header__tools">
              <Button variant="secondary" icon="download" onClick={handleExport} disabled={filtered.length === 0}>
                Exportar
              </Button>
              <ColumnMenu columns={COLUMNS} visible={visibleColumns} onChange={setVisibleColumns} />
            </div>
            <Button icon="plus" size="lg" onClick={() => setEditor({ open: true, product: null })}>
              Nuevo producto
            </Button>
          </>
        }
      />

      {error && <SectionError message={error} onRetry={() => reload().catch(() => {})} />}

      <section className="stat-grid admin-section" aria-label="Indicadores del catálogo">
        <StatCard
          label="Piezas activas"
          icon="box"
          tone="primary"
          loading={isLoading}
          value={formatNumber(kpis.active)}
          caption={`De ${pluralize(kpis.total, 'pieza')} en el catálogo comercial`}
          progress={kpis.activeRatio}
        />
        <StatCard
          label="Agotados / alerta"
          icon="alert"
          tone="danger"
          loading={isLoading}
          value={formatNumber(kpis.alerts)}
          badge={kpis.out > 0 ? <Badge tone="solid-danger">Urgente</Badge> : null}
          caption={`${pluralize(kpis.out, 'sin stock', 'sin stock')} · ${pluralize(kpis.low, 'con stock bajo', 'con stock bajo')}`}
          progress={kpis.alertRatio}
        />
        <StatCard
          label="Colección sustentable"
          icon="leaf"
          tone="success"
          loading={isLoading}
          value={formatPercent(kpis.sustainableRatio)}
          caption={`${pluralize(kpis.sustainable, 'pieza')} con maderas certificadas o recuperadas`}
          progress={kpis.sustainableRatio}
        />
        <StatCard
          label="Valoración del stock"
          icon="coins"
          tone="warning"
          loading={isLoading}
          value={formatCompactCurrency(kpis.value)}
          caption={`${pluralize(kpis.units, 'unidad', 'unidades')} en depósito${kpis.topCategory ? ` · ${formatPercent(kpis.topCategoryRatio)} en ${kpis.topCategory}` : ''}`}
          progress={kpis.topCategoryRatio}
        />
      </section>

      <Card padded={false} className="admin-section table-card">
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, SKU o material…" label="Buscar productos" />
          <FilterTabs label="Filtrar por categoría" options={categoryOptions} value={category} onChange={setCategory} />
          <div className="toolbar__end">
            <Select className="select--caps" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por estado de stock">
              <option value="all">Todos los estados</option>
              {Object.values(STOCK_STATUS).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {show('imagen') && <th scope="col">Imagen</th>}
                <th scope="col">Nombre &amp; SKU</th>
                {show('categoria') && <th scope="col">Categoría</th>}
                {show('precio') && <th scope="col" className="is-numeric">Precio (ARS)</th>}
                {show('stock') && <th scope="col">Stock</th>}
                {show('descripcion') && <th scope="col">Descripción</th>}
                {show('estado') && <th scope="col">Estado</th>}
                <th scope="col" className="is-actions">Acciones</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={pageSize} cols={visibleCount} />
            ) : (
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCount}>
                      <EmptyState
                        icon={hasFilters ? 'search' : 'box'}
                        title={hasFilters ? 'Ninguna pieza coincide con los filtros' : 'Todavía no hay productos'}
                        action={
                          hasFilters ? (
                            <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
                          ) : (
                            <Button icon="plus" onClick={() => setEditor({ open: true, product: null })}>Cargar el primero</Button>
                          )
                        }
                      >
                        {hasFilters ? 'Probá con otra búsqueda, categoría o estado.' : 'Las piezas que cargues aparecerán en el catálogo público.'}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((product) => {
                    const id = getProductId(product);
                    return (
                      <tr key={id}>
                        {show('imagen') && (
                          <td>
                            <ProductThumb product={product} />
                          </td>
                        )}
                        <td>
                          <Link to={ROUTES.product(id)} className="cell-title cell-link">{product.nombre}</Link>
                          <p className="cell-sub">SKU {getSku(product)}</p>
                        </td>
                        {show('categoria') && (
                          <td>
                            <Badge tone="primary">{product.categoria || INVENTORY.defaultCategory}</Badge>
                          </td>
                        )}
                        {show('precio') && <td className="is-numeric">{formatCurrency(product.precio, { precise: true })}</td>}
                        {show('stock') && (
                          <td>
                            <StockPill product={product} />
                          </td>
                        )}
                        {show('descripcion') && (
                          <td>
                            <p className="cell-clamp">{product.descripcion || '—'}</p>
                          </td>
                        )}
                        {show('estado') && (
                          <td>
                            <StockStatusBadge product={product} />
                          </td>
                        )}
                        <td className="is-actions">
                          <div className="cell-actions">
                            <Button variant="outline" size="sm" onClick={() => setEditor({ open: true, product })}>
                              Editar
                            </Button>
                            <IconButton icon="trash" variant="danger" label={`Eliminar ${product.nombre}`} onClick={() => setToDelete(product)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        <div className="table-footer">
          <div className="table-footer__row">
            <Pagination page={currentPage} pageSize={pageSize} total={filtered.length} onPageChange={setPage} itemLabel="piezas" />
            <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="Filas por página">
              {ADMIN.pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} por página
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <section className="callout admin-section" aria-label="Planificación del taller">
        <div className="callout__body">
          <span className="callout__icon" aria-hidden="true">
            <Icon name="calendar" size={18} />
          </span>
          <div>
            <h2 className="callout__title">Planificación de taller · Reposición</h2>
            <p className="callout__text">
              {kpis.alerts > 0
                ? `${pluralize(kpis.alerts, 'pieza está', 'piezas están')} en ${INVENTORY.lowStockThreshold} unidades o menos. Ajustá el stock a medida que el taller termina cada lote.`
                : 'Todas las piezas tienen stock por encima del umbral de reposición.'}
            </p>
          </div>
        </div>
        <Link to={`${ROUTES.adminInventory}?estado=alerta`} className="btn btn--outline btn--md">
          <span>Ver inventario</span>
          <Icon name="arrow-right" size={16} />
        </Link>
      </section>

      <Modal
        isOpen={editor.open}
        onClose={() => !saving && setEditor({ open: false, product: null })}
        eyebrow={editor.product ? `SKU ${getSku(editor.product)}` : 'Alta de producto'}
        title={editor.product ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor({ open: false, product: null })} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="product-editor" loading={saving}>
              {saving ? 'Guardando…' : editor.product ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </>
        }
      >
        <ProductForm formId="product-editor" product={editor.product} products={products} onSubmit={handleSave} onSubmittingChange={setSaving} />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setToDelete(null)}
      >
        <p>
          ¿Eliminar <strong>{toDelete?.nombre}</strong> del catálogo? Deja de mostrarse en la tienda y esta acción no se puede deshacer.
        </p>
      </ConfirmDialog>
    </>
  );
}
