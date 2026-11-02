import React, { useState } from 'react';
import { productService } from '../services/productService';

const EMPTY_FORM = {
  nombre: '',
  precio: '',
  stock: '0',
  categoria: 'Colección',
  descripcion: '',
  imagenUrl: ''
};

export const AdminCreateProductPage = ({ onCreated, onCancel }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSubmitError('');
  };

  const validate = () => {
    const next = {};
    if (!formData.nombre.trim()) next.nombre = 'El nombre del producto es obligatorio.';
    if (formData.precio === '' || Number.isNaN(Number(formData.precio))) {
      next.precio = 'El precio es obligatorio.';
    } else if (Number(formData.precio) < 0) {
      next.precio = 'El precio no puede ser negativo.';
    }
    if (formData.stock !== '' && (Number.isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
      next.stock = 'El stock no puede ser negativo.';
    }
    return next;
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
      const created = await productService.createProduct({
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        stock: formData.stock !== '' ? Number(formData.stock) : 0,
        categoria: formData.categoria.trim() || 'Colección',
        descripcion: formData.descripcion.trim(),
        imagenUrl: formData.imagenUrl.trim()
      });
      await onCreated(created);
    } catch (error) {
      setSubmitError(error.message || 'No se pudo crear el producto.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="contenedor">
          <p className="eyebrow">Panel de Administración</p>
          <h1>Nuevo Producto</h1>
        </div>
      </section>

      <section className="admin-main">
        <div className="contenedor">
          <article className="profile-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2>Datos del producto</h2>

            {submitError && <div className="auth-alert" role="alert">{submitError}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" type="text" required value={formData.nombre} onChange={handleChange} />
                <span className="mensaje-error">{errors.nombre || ''}</span>
              </div>

              <div className="product-form-grid">
                <div className={`campo ${errors.precio ? 'con-error' : ''}`}>
                  <label htmlFor="precio">Precio</label>
                  <input id="precio" name="precio" type="number" required min="0" step="0.01" value={formData.precio} onChange={handleChange} />
                  <span className="mensaje-error">{errors.precio || ''}</span>
                </div>
                <div className={`campo ${errors.stock ? 'con-error' : ''}`}>
                  <label htmlFor="stock">Stock</label>
                  <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
                  <span className="mensaje-error">{errors.stock || ''}</span>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="categoria">Categoría</label>
                <input id="categoria" name="categoria" type="text" value={formData.categoria} onChange={handleChange} />
              </div>

              <div className="campo">
                <label htmlFor="imagenUrl">URL de la imagen</label>
                <input id="imagenUrl" name="imagenUrl" type="text" value={formData.imagenUrl} onChange={handleChange} />
              </div>

              <div className="campo">
                <label htmlFor="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" rows="4" value={formData.descripcion} onChange={handleChange} />
              </div>

              <div className="product-form-actions">
                <button type="button" className="home-button home-button--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="boton-enviar" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
};
