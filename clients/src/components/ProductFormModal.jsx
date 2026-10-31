import React, { useEffect, useState } from 'react';

const CATEGORIES = ['Almacenamiento', 'Asientos', 'Mesas', 'Dormitorio', 'Oficina', 'Colección'];

const EMPTY_FORM = {
  nombre: '',
  precio: '',
  stock: '0',
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
        stock: String(product.stock ?? 0),
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
    if (!formData.nombre.trim()) nextErrors.nombre = 'El nombre del mueble es obligatorio.';
    if (formData.precio === '' || Number.isNaN(Number(formData.precio))) {
      nextErrors.precio = 'Ingresá un precio válido.';
    } else if (Number(formData.precio) < 0) {
      nextErrors.precio = 'El precio no puede ser negativo.';
    }
    if (formData.stock === '' || Number.isNaN(Number(formData.stock))) {
      nextErrors.stock = 'Ingresá un stock válido.';
    } else if (Number(formData.stock) < 0) {
      nextErrors.stock = 'El stock no puede ser negativo.';
    }
    if (!formData.categoria.trim()) nextErrors.categoria = 'Elegí una categoría.';
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
        stock: Number(formData.stock),
        categoria: formData.categoria.trim(),
        descripcion: formData.descripcion.trim(),
        imagenUrl: formData.imagenUrl.trim()
      });
    } catch (error) {
      setSubmitError(error.message || 'No se pudo guardar el mueble.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="presentation">
      <div className="auth-modal product-form-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <span className="esquina esquina--tl" aria-hidden="true"></span>
        <span className="esquina esquina--tr" aria-hidden="true"></span>
        <span className="esquina esquina--bl" aria-hidden="true"></span>
        <span className="esquina esquina--br" aria-hidden="true"></span>

        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <p className="auth-eyebrow">{isEdit ? 'Edición de inventario' : 'Alta de inventario'}</p>
        <h2>{isEdit ? 'Editar mueble' : 'Nuevo mueble'}</h2>

        {submitError && <div className="auth-alert" role="alert">{submitError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
            <label htmlFor="producto-nombre">Nombre</label>
            <input id="producto-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} />
            <span className="mensaje-error">{errors.nombre || ''}</span>
          </div>

          <div className="product-form-grid">
            <div className={`campo ${errors.precio ? 'con-error' : ''}`}>
              <label htmlFor="producto-precio">Precio (ARS)</label>
              <input id="producto-precio" name="precio" type="number" min="0" step="1" value={formData.precio} onChange={handleChange} />
              <span className="mensaje-error">{errors.precio || ''}</span>
            </div>
            <div className={`campo ${errors.stock ? 'con-error' : ''}`}>
              <label htmlFor="producto-stock">Stock</label>
              <input id="producto-stock" name="stock" type="number" min="0" step="1" value={formData.stock} onChange={handleChange} />
              <span className="mensaje-error">{errors.stock || ''}</span>
            </div>
          </div>

          <div className={`campo ${errors.categoria ? 'con-error' : ''}`}>
            <label htmlFor="producto-categoria">Categoría</label>
            <select id="producto-categoria" name="categoria" value={formData.categoria} onChange={handleChange}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <span className="mensaje-error">{errors.categoria || ''}</span>
          </div>

          <div className="campo">
            <label htmlFor="producto-descripcion">Descripción</label>
            <textarea id="producto-descripcion" name="descripcion" rows="4" value={formData.descripcion} onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="producto-imagen">URL de la imagen</label>
            <input id="producto-imagen" name="imagenUrl" type="text" placeholder="/assets/pieza.png" value={formData.imagenUrl} onChange={handleChange} />
          </div>

          <div className="product-form-actions">
            <button type="button" className="home-button home-button--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="boton-enviar" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear mueble'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
