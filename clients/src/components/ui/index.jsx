import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export { Icon };

const cx = (...classes) => classes.filter(Boolean).join(' ');

/* ---------- Botón ---------- */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block = false,
  loading = false,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx('btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className)}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}

export function IconButton({ icon, label, variant = 'ghost', size = 'md', className, ...props }) {
  return (
    <button
      type="button"
      className={cx('icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={size === 'sm' ? 15 : 18} />
    </button>
  );
}

/* ---------- Etiquetas de estado ---------- */
export function Badge({ tone = 'neutral', dot = false, children, className }) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Eyebrow({ icon, children }) {
  return (
    <p className="eyebrow">
      {icon && <Icon name={icon} size={14} />}
      <span>{children}</span>
    </p>
  );
}

/* ---------- Encabezado de página ---------- */
export function PageHeader({ eyebrow, eyebrowIcon, title, lead, actions, align = 'start', children }) {
  return (
    <header className={cx('page-header', align === 'center' && 'page-header--center')}>
      <div className="page-header__copy">
        {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

/* ---------- Tarjetas ---------- */
export function Card({ as: Tag = 'section', padded = true, className, children, ...props }) {
  return (
    <Tag className={cx('card', padded && 'card--padded', className)} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Tarjeta de indicador. `progress` (0–1) dibuja la barra inferior con el tono indicado.
 */
export function StatCard({ label, value, caption, icon, tone = 'primary', progress, badge, loading = false }) {
  return (
    <article className={cx('stat-card', `stat-card--${tone}`)} aria-busy={loading || undefined}>
      <header className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && (
          <span className="stat-card__icon" aria-hidden="true">
            <Icon name={icon} size={16} />
          </span>
        )}
      </header>
      <div className="stat-card__value-row">
        <strong className="stat-card__value">{loading ? '—' : value}</strong>
        {badge && !loading && badge}
      </div>
      {caption && <p className="stat-card__caption">{caption}</p>}
      {typeof progress === 'number' && (
        <div className="stat-card__track" aria-hidden="true">
          <span className="stat-card__bar" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
        </div>
      )}
    </article>
  );
}

/* ---------- Formularios ---------- */
export function Field({ label, error, hint, children, htmlFor, className }) {
  return (
    <div className={cx('field', error && 'field--error', className)}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="field__message" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}

export const Input = React.forwardRef(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={cx('input', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...props} />;
});

export function Textarea({ className, invalid, ...props }) {
  return <textarea className={cx('input', 'input--textarea', invalid && 'input--invalid', className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <div className={cx('select', className)}>
      <select {...props}>{children}</select>
      <Icon name="chevron-down" size={14} className="select__chevron" />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…', label = 'Buscar', id }) {
  const fallbackId = useId();
  const inputId = id || fallbackId;
  return (
    <div className="search-input">
      <label htmlFor={inputId} className="visually-hidden">
        {label}
      </label>
      <Icon name="search" size={16} className="search-input__icon" />
      <input
        id={inputId}
        type="search"
        className="input search-input__field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

/** Filtros en forma de pastillas con contador (categorías, estados). */
export function FilterTabs({ options, value, onChange, label }) {
  return (
    <div className="filter-tabs" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx('filter-tab', value === option.value && 'is-active')}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {typeof option.count === 'number' && <span className="filter-tab__count">({option.count})</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Paginación ---------- */
const pageWindow = (page, totalPages) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]));
};

export function Pagination({ page, pageSize, total, onPageChange, itemLabel = 'resultados' }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pagination">
      <p className="pagination__summary">
        Mostrando <strong>{from}</strong> a <strong>{to}</strong> de <strong>{total}</strong> {itemLabel}
      </p>
      {totalPages > 1 && (
        <nav className="pagination__pages" aria-label="Paginación">
          <IconButton icon="chevron-left" label="Página anterior" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
          {pageWindow(page, totalPages).map((item, index) =>
            item === '…' ? (
              <span key={`gap-${index}`} className="pagination__gap">…</span>
            ) : (
              <button
                key={item}
                type="button"
                className={cx('pagination__page', item === page && 'is-active')}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            )
          )}
          <IconButton icon="chevron-right" label="Página siguiente" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        </nav>
      )}
    </div>
  );
}

/* ---------- Estados vacíos y alertas ---------- */
export function EmptyState({ icon = 'box', title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {children && <p className="empty-state__text">{children}</p>}
      {action}
    </div>
  );
}

export function Alert({ tone = 'danger', children, action }) {
  return (
    <div className={cx('alert', `alert--${tone}`)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={tone === 'success' ? 'check' : tone === 'danger' ? 'alert' : 'info'} size={16} />
      <div className="alert__body">{children}</div>
      {action}
    </div>
  );
}

export function Spinner({ label = 'Cargando' }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

/* ---------- Modal ---------- */
export function Modal({ isOpen, onClose, title, eyebrow, size = 'md', children, footer, variant = 'dialog' }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    document.body.classList.add('has-overlay');
    const handleKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target =
        panel?.querySelector('[data-autofocus]') ||
        panel?.querySelector('input:not([type="hidden"]), select, textarea');
      (target || panel)?.focus();
    });
    return () => {
      document.body.classList.remove('has-overlay');
      document.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={cx('overlay', variant === 'drawer' && 'overlay--drawer')} onMouseDown={onClose} role="presentation">
      <div
        ref={panelRef}
        className={cx(variant === 'drawer' ? 'drawer' : 'modal', `modal--${size}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            {eyebrow && <p className="modal__eyebrow">{eyebrow}</p>}
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
          </div>
          <IconButton icon="x" label="Cerrar" onClick={onClose} className="modal__close" />
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ isOpen, title, children, confirmLabel = 'Confirmar', tone = 'danger', loading, onConfirm, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} data-autofocus>
            {loading ? 'Procesando…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm-text">{children}</div>
    </Modal>
  );
}
