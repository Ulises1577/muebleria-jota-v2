import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout, CustomerOnly, GuestOnly, RequireAuth, SiteLayout } from './components/layout/Layouts';
import { ROUTES } from './config/routes';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { DetailPage } from './pages/DetailPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCreateProductPage } from './pages/admin/AdminCreateProductPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <Routes>
              <Route path={ROUTES.login} element={<GuestOnly><LoginPage /></GuestOnly>} />
              <Route path={ROUTES.register} element={<GuestOnly><RegisterPage /></GuestOnly>} />
                  
               <Route element={<SiteLayout />}>
                <Route index element={<HomePage />} />
                <Route path={ROUTES.catalog} element={<CatalogPage />} />
                <Route path="/catalogo" element={<Navigate to={ROUTES.catalog} replace />} />
                <Route path="/productos/:id" element={<DetailPage />} />
                <Route path={ROUTES.contact} element={<CustomerOnly><ContactPage /></CustomerOnly>} />
                <Route path={ROUTES.profile} element={<RequireAuth><UserProfilePage /></RequireAuth>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>          

              <Route path={ROUTES.admin} element={<AdminLayout />}>
                <Route index element={<AdminProductsPage />} />
                <Route path="productos/nuevo" element={<AdminCreateProductPage />} />
                <Route path="crear-producto" element={<Navigate to={ROUTES.adminNewProduct} replace />} />
                <Route path="inventario" element={<AdminInventoryPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
                <Route path="clientes" element={<AdminClientsPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
