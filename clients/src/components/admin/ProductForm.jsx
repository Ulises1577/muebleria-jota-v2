import React, { useEffect, useMemo, useState } from 'react';
import { INVENTORY } from '../../config/site';
import { getCategories } from '../../utils/inventory';
import { formatCurrency } from '../../utils/format';
import { Alert, Field, Icon, Input, Textarea } from '../ui';

const toFormState = (product) => ({
  nombre: product?.nombre || '',
  categoria: product?.categoria || INVENTORY.defaultCategory,
  precio: product?.precio ?? '',
  stock: product?.stock ?? 0,
  imagenUrl: product?.imagenUrl || product?.imagen || '',
  descripcion: product?.descripcion || ''
});

export const validateProduct = (data) => {
  const errors = {};
  if (!String(data.nombre).trim()) errors.nombre = 'El nombre del producto es obligatorio.';
  if (data.precio === '' || data.precio === null || Number.isNaN(Number(data.precio))) errors.precio = 'Ingresá un precio.';
  else if (Number(data.precio) < 0) errors.precio = 'El precio no puede ser negativo.';
  if (data.stock === '' || Number.isNaN(Number(data.stock))) errors.stock = 'Ingresá el stock (0 si no hay unidades).';
  else if (Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) errors.stock = 'El stock debe ser un número entero positivo.';
  return errors;
};

const toPayload = (data) => ({
  nombre: data.nombre.trim(),
  categoria: data.categoria.trim() || INVENTORY.defaultCategory,
  precio: Number(data.precio),
  stock: Number(data.stock),
  imagenUrl: data.imagenUrl.trim(),
  descripcion: data.descripcion.trim()
});

/**
 * Formulario de producto compartido por el modal de edición y la página de alta.
 * Se envía con un botón externo usando el atributo form={formId}.
 */
export function ProductForm({ formId, product, products = [], onSubmit, onSubmittingChange }) {
  const [data, setData] = useState(() => toFormState(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setData(toFormState(product));
    setErrors({});
    setSubmitError('');
  }, [product]);

  useEffect(() => setImageFailed(false), [data.imagenUrl]);

  const categories = useMemo(() => {
    const names = new Set([...INVENTORY.suggestedCategories, ...getCategories(products).map((c) => c.name)]);
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProduct(data);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmittingChange?.(true);
    try {
      await onSubmit(toPayload(data));
    } catch (error) {
      setSubmitError(error.message || 'No se pudo guardar el producto.');
    } finally {
      onSubmittingChange?.(false);
    }
  };

  const listId = `${formId}-categorias`;
  const hasImage = data.imagenUrl.trim() && !imageFailed;

  return (
    <form id={formId} className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="product-form__fields form-grid">
        {submitError && <Alert>{submitError}</Alert>}

        <Field label="Nombre" htmlFor={`${formId}-nombre`} error={errors.nombre}>
          <Input id={`${formId}-nombre`} name="nombre" value={data.nombre} onChange={handleChange} invalid={Boolean(errors.nombre)} data-autofocus />
        </Field>

        <div className="form-grid form-grid--2">
          <Field label="Categoría" htmlFor={`${formId}-categoria`} hint="Elegí una existente o escribí una nueva.">
            <Input id={`${formId}-categoria`} name="categoria" list={listId} value={data.categoria} onChange={handleChange} />
            <datalist id={listId}>
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <Field label="Precio (ARS)" htmlFor={`${formId}-precio`} error={errors.precio} hint={!errors.precio && data.precio !== '' ? formatCurrency(data.precio) : undefined}>
            <Input id={`${formId}-precio`} name="precio" type="number" min="0" step="1000" inputMode="numeric" value={data.precio} onChange={handleChange} invalid={Boolean(errors.precio)} />
          </Field>
        </div>

        <div className="form-grid form-grid--2">
          <Field label="Stock (unidades)" htmlFor={`${formId}-stock`} error={errors.stock} hint={`Bajo stock con ${INVENTORY.lowStockThreshold} o menos.`}>
            <Input id={`${formId}-stock`} name="stock" type="number" min="0" step="1" inputMode="numeric" value={data.stock} onChange={handleChange} invalid={Boolean(errors.stock)} />
          </Field>
          <Field label="URL de la imagen" htmlFor={`${formId}-imagen`} hint="Ruta pública, por ejemplo /assets/archivo.png">
            <Input id={`${formId}-imagen`} name="imagenUrl" value={data.imagenUrl} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Descripción" htmlFor={`${formId}-descripcion`}>
          <Textarea id={`${formId}-descripcion`} name="descripcion" rows={4} value={data.descripcion} onChange={handleChange} />
        </Field>
      </div>

      <aside className="product-form__preview" aria-label="Vista previa">
        <p className="field__label">Vista previa</p>
        <div className="product-form__image">
          {hasImage ? (
            <img src={data.imagenUrl} alt="" onError={() => setImageFailed(true)} />
          ) : (
            <span className="product-form__placeholder">
              <Icon name="image" size={28} />
              {data.imagenUrl.trim() ? 'No se pudo cargar la imagen' : 'Sin imagen'}
            </span>
          )}
        </div>
        <p className="product-card__category">{data.categoria || INVENTORY.defaultCategory}</p>
        <p className="cell-title">{data.nombre || 'Nombre del producto'}</p>
        <p className="product-form__price">{data.precio !== '' ? formatCurrency(data.precio) : '—'}</p>
      </aside>
    </form>
  );
}
