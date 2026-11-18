import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { Alert, Button, Card, EmptyState, FilterTabs, PageHeader, SearchInput, Select } from '../components/ui';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentTitle } from '../hooks';
import { getCategories, getProductId, getStockStatus, matchesProductSearch } from '../utils/inventory';
import { pluralize } from '../utils/format';

const SORTS = {
  relevance: { label: 'Relevancia', fn: (a, b) => Number(getStockStatus(a).key === 'out') - Number(getStockStatus(b).key === 'out') },
  'price-asc': { label: 'Precio: menor a mayor', fn: (a, b) => a.precio - b.precio },
  'price-desc': { label: 'Precio: mayor a menor', fn: (a, b) => b.precio - a.precio },
  'name-asc': { label: 'Nombre: A-Z', fn: (a, b) => a.nombre.localeCompare(b.nombre) }
};

export function CatalogPage() {
  useDocumentTitle('Catálogo');
  const { products, isLoading, error, reload } = useCatalog();

  // Los filtros viven en la URL: se pueden compartir y sobreviven a "atrás"
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const category = params.get('categoria') || 'all';
  const sort = SORTS[params.get('orden')] ? params.get('orden') : 'relevance';
  const onlyAvailable = params.get('disponibles') === '1';

  const updateParam = (key, value, defaultValue) => {
    const next = new URLSearchParams(params);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const categories = useMemo(() => getCategories(products), [products]);
  const results = useMemo(
    () =>
      products
        .filter(
          (product) =>
            matchesProductSearch(product, search) &&
            (category === 'all' || product.categoria === category) &&
            (!onlyAvailable || getStockStatus(product).key !== 'out')
        )
        .sort(SORTS[sort].fn),
    [products, search, category, sort, onlyAvailable]
  );

  const hasFilters = Boolean(search || category !== 'all' || sort !== 'relevance' || onlyAvailable);

  return (
    <div className="container store-page">
      <PageHeader
        align="center"
        eyebrow="Colección permanente"
        title="Nuestra colección"
        lead="Piezas únicas de mobiliario diseñadas con materiales sostenibles y acabado artesanal."
      />

      <Card padded={false} className="catalog-toolbar">
        <div className="toolbar">
          <SearchInput value={search} onChange={(value) => updateParam('q', value)} placeholder="Buscar por nombre o material…" label="Buscar en el catálogo" />
          <div className="toolbar__end">
            <label className="check-toggle">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => updateParam('disponibles', e.target.checked ? '1' : '')} />
              Solo disponibles
            </label>
            <Select value={sort} onChange={(e) => updateParam('orden', e.target.value, 'relevance')} aria-label="Ordenar productos">
              {Object.entries(SORTS).map(([key, option]) => (
                <option key={key} value={key}>{option.label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="toolbar toolbar--divided">
          <FilterTabs
            label="Filtrar por categoría"
            value={category}
            onChange={(value) => updateParam('categoria', value, 'all')}
            options={[{ value: 'all', label: 'Todas', count: products.length }, ...categories.map((c) => ({ value: c.name, label: c.name, count: c.count }))]}
          />
        </div>
      </Card>

      <div className="results-bar">
        <p aria-live="polite">{isLoading ? 'Cargando piezas…' : pluralize(results.length, 'producto')}</p>
        {hasFilters && (
          <Button variant="link" onClick={() => setParams({}, { replace: true })}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {error ? (
        <Alert action={<Button variant="outline" size="sm" icon="refresh" onClick={() => reload().catch(() => {})}>Reintentar</Button>}>
          <strong>No pudimos cargar el catálogo.</strong> {error}
        </Alert>
      ) : isLoading ? (
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <EmptyState
            icon="search"
            title="No encontramos piezas para tu búsqueda"
            action={hasFilters && <Button variant="outline" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</Button>}
          >
            Probá con otro nombre, otra categoría o quitá los filtros para ver toda la colección.
          </EmptyState>
        </Card>
      ) : (
        <div className="product-grid">
          {results.map((product) => (
            <ProductCard key={getProductId(product)} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
