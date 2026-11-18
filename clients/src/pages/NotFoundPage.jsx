import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { useDocumentTitle } from '../hooks';
import { ROUTES } from '../config/routes';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <div className="container store-page">
      <EmptyState
        icon="search"
        title="No encontramos esta página"
        action={
          <Link to={ROUTES.catalog} className="btn btn--primary btn--md">
            <span>Ir al catálogo</span>
          </Link>
        }
      >
        El enlace puede haber cambiado. Desde el catálogo podés ver toda la colección.
      </EmptyState>
    </div>
  );
}
