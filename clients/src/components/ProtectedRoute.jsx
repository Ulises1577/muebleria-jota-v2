import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import { Spinner } from './ui';

/**
 * Componente <ProtectedRoute> (Requisito Sprint 7 y 8)
 * 
 * Intercepta el acceso a rutas privadas del e-commerce:
 * 1. Si no hay usuario logueado en AuthContext, redirige a /login recordando
 *    la ruta previa en `state.from` para retornar tras autenticarse.
 * 2. Si la ruta requiere privilegios de administrador (`requireAdmin`) y el
 *    usuario es cliente común, redirige al inicio (/)..
 * 3. Si la verificación es exitosa:
 *    - Si se usa como componente contenedor: renderiza `children`.
 *    - Si se usa como Layout Route en React Router: renderiza `<Outlet />`.
 */
export function ProtectedRoute({ children, requireAdmin = false, redirectTo = ROUTES.login }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="center-block"><Spinner label="Verificando sesión" /></div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
