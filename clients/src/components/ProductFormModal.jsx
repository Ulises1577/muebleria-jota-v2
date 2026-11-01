import React, { useEffect, useState } from 'react';

const EMPTY_FORM = {
  nombre: '',
  precio: '',
  stock: 0,
  categoria: 'Colección',
  descripcion: '',
  imagenUrl: ''
};

export const ProductFormModal = ({ isOpen, product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isEdit = Boolean(product);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setFormData({
        nombre: product.nombre || '',
        precio: product.precio ?? '',
        stock: product.stock ?? 0,
        categoria: product.categoria || 'Colección',
        descripcion: product.descripcion || '',
        imagenUrl: product.imagenUrl || product.imagen || ''
      });
    } else {
      setFormData(EMPTY_FORM);
    }

    setErrors({});
    setSubmitError('');
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.nombre || !formData.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio.';
    }
    if (formData.precio === '' || formData.precio === null || Number.isNaN(Number(formData.precio))) {
      nextErrors.precio = 'El precio es obligatorio.';
    } else if (Number(formData.precio) < 0) {
      nextErrors.precio = 'El precio no puede ser negativo.';
    }
    if (formData.stock !== '' && formData.stock !== null && (Number.isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      nextErrors.stock = 'El stock no puede ser negativo.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        stock: formData.stock !== '' ? Number(formData.stock) : 0,
        categoria: formData.categoria ? formData.categoria.trim() : 'Colección',
        imagenUrl: formData.imagenUrl ? formData.imagenUrl.trim() : '',
        descripcion: formData.descripcion ? formData.descripcion.trim() : ''
      });
    } catch (error) {
      setSubmitError(error.message || 'No se pudo guardar el producto.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="auth-modal product-form-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <p className="auth-eyebrow">{isEdit ? 'Edición de producto' : 'Alta de producto'}</p>
        <h2>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>

        {submitError && <div className="auth-alert" role="alert">{submitError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
            />
            <span className="mensaje-error">{errors.nombre || ''}</span>
          </div>

          <div className="product-form-grid">
            <div className={`campo ${errors.precio ? 'con-error' : ''}`}>
              <label htmlFor="precio">Precio</label>
              <input
                id="precio"
                name="precio"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.precio || ''}</span>
            </div>
            <div className={`campo ${errors.stock ? 'con-error' : ''}`}>
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
              />
              <span className="mensaje-error">{errors.stock || ''}</span>
            </div>
          </div>

          <div className="campo">
            <label htmlFor="categoria">Categoría</label>
            <input
              id="categoria"
              name="categoria"
              type="text"
              value={formData.categoria}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="imagenUrl">URL de la imagen</label>
            <input
              id="imagenUrl"
              name="imagenUrl"
              type="text"
              value={formData.imagenUrl}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="product-form-actions">
            <button type="button" className="home-button home-button--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="boton-enviar" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
