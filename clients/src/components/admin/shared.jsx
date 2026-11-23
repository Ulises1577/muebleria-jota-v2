import React, { useCallback, useRef, useState } from 'react';
import { getStockStatus } from '../../utils/inventory';
import { formatNumber } from '../../utils/format';
import { useDismiss } from '../../hooks';
import { Badge, Button, Icon } from '../ui';

export function StockPill({ product }) {
  const status = getStockStatus(product);
  const stock = Number(product.stock ?? 0);
  return (
    <span className={`stock-pill stock-pill--${status.key}`} title={status.label}>
      {formatNumber(stock)} <small>unid.</small>
    </span>
  );
}

export function StockStatusBadge({ product }) {
  const status = getStockStatus(product);
  return <Badge tone={status.tone}>{status.label}</Badge>;
}

export function ProductThumb({ product }) {
  const [failed, setFailed] = useState(false);
  const src = product.imagenUrl || product.imagen;
  if (!src || failed) {
    return (
      <span className="thumb thumb--empty" aria-hidden="true">
        <Icon name="image" size={18} />
      </span>
    );
  }
  return <img className="thumb" src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

/** Menú para mostrar u ocultar columnas de una tabla. Las columnas `locked` no se pueden ocultar. */
export function ColumnMenu({ columns, visible, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, close, open);

  const toggle = (key) => {
    onChange(visible.includes(key) ? visible.filter((item) => item !== key) : [...visible, key]);
  };

  return (
    <div className="popover-anchor" ref={ref}>
      <Button variant="secondary" icon="columns" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)}>
        Configurar columnas
      </Button>
      {open && (
        <div className="popover" role="group" aria-label="Columnas visibles">
          <p className="popover__title">Columnas visibles</p>
          {columns.map((column) => (
            <label key={column.key} className="menu-item">
              <input
                type="checkbox"
                checked={column.locked || visible.includes(column.key)}
                disabled={column.locked}
                onChange={() => toggle(column.key)}
              />
              {column.label}
            </label>
          ))}
          <div className="menu-divider" />
          <button type="button" className="menu-item" onClick={() => onChange(columns.map((column) => column.key))}>
            <Icon name="refresh" size={15} /> Mostrar todas
          </button>
        </div>
      )}
    </div>
  );
}

export function SectionError({ message, onRetry }) {
  return (
    <div className="alert alert--danger" role="alert">
      <Icon name="alert" size={16} />
      <div className="alert__body">{message}</div>
      {onRetry && (
        <Button variant="outline" size="sm" icon="refresh" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <span className="skeleton" style={{ height: c === 0 ? 40 : 12, width: c === 0 ? 40 : `${60 + ((r + c) % 3) * 15}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
