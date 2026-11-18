import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks';
import { ROUTES } from '../../config/routes';
import { Button, Card, PageHeader } from '../../components/ui';
import { ProductForm } from '../../components/admin/ProductForm';

export function AdminCreateProductPage() {
  useDocumentTitle('Nuevo producto');
  const { products, createProduct } = useCatalog();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleCreate = async (payload) => {
    const created = await createProduct(payload);
    notify(`Se agregó ${created?.nombre || payload.nombre} al catálogo.`);
    navigate(ROUTES.admin);
  };

  return (
    <>
      <PageHeader eyebrow="Alta de producto" eyebrowIcon="plus" title="Nuevo producto" lead="La pieza se publica en el catálogo apenas la guardás." />
      <Card className="admin-section">
        <ProductForm formId="create-product" products={products} onSubmit={handleCreate} onSubmittingChange={setSaving} />
        <div className="form-actions form-actions--divided">
          <Button variant="secondary" onClick={() => navigate(ROUTES.admin)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="create-product" loading={saving}>
            {saving ? 'Guardando…' : 'Crear producto'}
          </Button>
        </div>
      </Card>
    </>
  );
}
