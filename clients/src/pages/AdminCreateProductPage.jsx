import React, { useState } from 'react';
import { productService } from '../services/productService';

const CATEGORIES = ['Almacenamiento', 'Asientos', 'Mesas', 'Dormitorio', 'Oficina', 'Colección'];

const EMPTY_FORM = {
  nombre: '',
  precio: '',
  stock: '1',
  categoria: 'Colección',
  descripcion: '',
  imagenUrl: ''
};

const formatPrice = (value) => Number(value || 0).toLocaleString('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

/**
 * Vista de administrador: Alta de producto (/admin/crear-producto).
 * Consume POST /api/productos (requiere token con rol admin).
 */
export const AdminCreateProductPage = ({ onCreated, onCancel }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSubmitError('');
    if (name === 'imagenUrl') setImageFailed(false);
  };

  const validate = () => {
    const next = {};
    if (!formData.nombre.trim()) next.nombre = 'El nombre del mueble es obligatorio.';
    if (formData.precio === '' || Number.isNaN(Number(formData.precio))) {
      next.precio = 'Ingresá un precio válido.';
    } else if (Number(formData.precio) < 0) {
      next.precio = 'El precio no puede ser negativo.';
    }
    if (formData.stock === '' || Number.isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      next.stock = 'Ingresá un stock válido (0 o más).';
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
        stock: Number(formData.stock),
        categoria: formData.categoria,
        descripcion: formData.descripcion.trim(),
        imagenUrl: formData.imagenUrl.trim()
      });
      await onCreated(created);
    } catch (error) {
      setSubmitError(error.message || 'No se pudo crear el mueble.');
      setIsSubmitting(false);
    }
  };

  const showImage = formData.imagenUrl.trim() && !imageFailed;

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="contenedor">
          <p className="eyebrow">Panel exclusivo · Alta de inventario</p>
          <h1>Nuevo mueble</h1>
          <p className="admin-hero__texto">
            Cargá una pieza nueva en el catálogo. Se publica apenas la guardás.
          </p>
        </div>
      </section>

      <section className="admin-main">
        <div className="contenedor profile-grid">
          <article className="profile-card">
            <span className="esquina esquina--tl" aria-hidden="true"></span>
            <span className="esquina esquina--tr" aria-hidden="true"></span>
            <h2>Datos de la pieza</h2>

            {submitError && <div className="auth-alert" role="alert">{submitError}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={`campo ${errors.nombre ? 'con-error' : ''}`}>
                <label htmlFor="nuevo-nombre">Nombre</label>
                <input id="nuevo-nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} />
                <span className="mensaje-error">{errors.nombre || ''}</span>
              </div>

              <div className="product-form-grid">
                <div className={`campo ${errors.precio ? 'con-error' : ''}`}>
                  <label htmlFor="nuevo-precio">Precio (ARS)</label>
                  <input id="nuevo-precio" name="precio" type="number" min="0" step="1" value={formData.precio} onChange={handleChange} />
                  <span className="mensaje-error">{errors.precio || ''}</span>
                </div>
                <div className={`campo ${errors.stock ? 'con-error' : ''}`}>
                  <label htmlFor="nuevo-stock">Stock</label>
                  <input id="nuevo-stock" name="stock" type="number" min="0" step="1" value={formData.stock} onChange={handleChange} />
                  <span className="mensaje-error">{errors.stock || ''}</span>
                </div>
              </div>

              <div className="campo">
                <label htmlFor="nuevo-categoria">Categoría</label>
                <select id="nuevo-categoria" name="categoria" value={formData.categoria} onChange={handleChange}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="nuevo-descripcion">Descripción</label>
                <textarea id="nuevo-descripcion" name="descripcion" rows="4" value={formData.descripcion} onChange={handleChange} />
              </div>

              <div className="campo">
                <label htmlFor="nuevo-imagen">URL de la imagen</label>
                <input id="nuevo-imagen" name="imagenUrl" type="text" placeholder="/assets/pieza.png" value={formData.imagenUrl} onChange={handleChange} />
              </div>

              <div className="product-form-actions">
                <button type="button" className="home-button home-button--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="boton-enviar" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando…' : 'Crear mueble'}
                </button>
              </div>
            </form>
          </article>

          <aside className="profile-side">
            <article className="profile-card">
              <h2>Vista previa</h2>
              <p className="profile-card__lead">Así se va a ver la pieza en el catálogo.</p>
              <div className="admin-preview">
                {showImage ? (
                  <img
                    className="admin-preview__img"
                    src={formData.imagenUrl.trim()}
                    alt={formData.nombre || 'Vista previa del mueble'}
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="admin-preview__img admin-preview__img--vacia">Sin imagen</div>
                )}
                <span className="admin-product-category">{formData.categoria}</span>
                <strong className="admin-preview__nombre">{formData.nombre || 'Nombre del mueble'}</strong>
                <span className="admin-preview__precio">{formatPrice(formData.precio)}</span>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
};
