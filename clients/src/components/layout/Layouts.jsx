import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';
import { SiteHeader } from './SiteHeader';
import { AdminFooter, SiteFooter } from './SiteFooter';
import { CartDrawer } from '../CartDrawer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** Tienda: cabecera, contenido, pie y carrito. */
export function SiteLayout() {
  const { isAdmin } = useAuth();
  return (
    <div className="app-shell">
      <ScrollToTop />
      <SiteHeader />
      <main className="app-main" id="contenido">
        <Outlet />
      </main>
      {isAdmin ? <AdminFooter /> : <SiteFooter />}
      {!isAdmin && <CartDrawer />}
    </div>
  );
}

/** Panel: solo administradores. Sin sesión se pide login; con otro rol se vuelve al inicio. */
export function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to={ROUTES.home} replace />;

  return (
    <div className="app-shell">
      <ScrollToTop />
      <SiteHeader />
      <main className="app-main app-main--admin" id="contenido">
        <div className="container container--wide">
          <Outlet />
        </div>
      </main>
      <AdminFooter />
    </div>
  );
}

import { ProtectedRoute } from '../ProtectedRoute';
export { ProtectedRoute };
export const RequireAuth = ProtectedRoute;

/** Vistas solo para clientes (el administrador no usa Contacto). */
export function CustomerOnly({ children }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to={ROUTES.home} replace />;
  return children;
}

/** Login y registro: si ya hay sesión, se redirige. */
export function GuestOnly({ children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from || (isAdmin ? ROUTES.admin : ROUTES.home)} replace />;
  return children;
}
