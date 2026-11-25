import React from 'react';
import { OrderHistory } from '../components/OrderHistory';
import { PageHeader } from '../components/ui';
import { useDocumentTitle } from '../hooks';

export function UserOrdersPage() {
  useDocumentTitle('Mis pedidos');

  return (
    <div className="container store-page">
      <PageHeader
        eyebrow="Mi cuenta"
        eyebrowIcon="receipt"
        title="Mis pedidos"
        lead="Consultá el estado y los detalles de tus compras."
      />
      <OrderHistory />
    </div>
  );
}
