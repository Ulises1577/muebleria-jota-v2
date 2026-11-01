import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { LoginModal } from './components/LoginModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { DetailPage } from './pages/DetailPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { AdminCreateProductPage } from './pages/AdminCreateProductPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { productService } from './services/productService';
import { authService, SESSION_EXPIRED_EVENT } from './services/authService';
import './App.css';

const ORDERS_KEY_PREFIX = 'hermanos_jota_orders_';

// Mapa vista <-> URL (sin librerías: History API)
const pathForView = (view, productId) => {
  switch (view) {
    case 'catalog': return '/productos';
    case 'detail': return productId ? `/productos/${productId}` : '/productos';
    case 'contact': return '/contacto';
    case 'admin': return '/admin';
    case 'admin-create': return '/admin/crear-producto';
    case 'profile': return '/perfil';
    default: return '/';
  }
};

const parsePath = (pathname) => {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/productos') return { view: 'catalog', id: null };
  if (path.startsWith('/productos/')) return { view: 'detail', id: decodeURIComponent(path.split('/')[2]) };
  if (path === '/contacto') return { view: 'contact', id: null };
  if (path === '/admin') return { view: 'admin', id: null };
  if (path === '/admin/crear-producto') return { view: 'admin-create', id: null };
  if (path === '/perfil') return { view: 'profile', id: null };
  return { view: 'home', id: null };
};

const isAdminView = (view) => view === 'admin' || view === 'admin-create';

export function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentView, setCurrentView] = useState(() => parsePath(window.location.pathname).view);
  const [selectedProductId, setSelectedProductId] = useState(() => parsePath(window.location.pathname).id);
  const [contactPrefill, setContactPrefill] = useState(null);

  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hermanos_jota_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('hermanos_jota_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productService.getProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error al conectar con el servidor.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const storedToken = authService.getToken();
    if (!storedToken) return undefined;

    authService.me()
      .then((currentUser) => {
        if (!isMounted) return;
        setUser(currentUser);
        setToken(storedToken);
      })
      .catch(() => {
        if (!isMounted) return;
        authService.logout();
        setUser(null);
        setToken(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      authService.logout();
      setUser(null);
      setToken(null);
      setCurrentView('home');
      setIsLoginOpen(true);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  // Sincroniza la URL con la vista actual y atiende los botones atrás/adelante
  useEffect(() => {
    const target = pathForView(currentView, selectedProductId);
    if (window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  }, [currentView, selectedProductId]);

  useEffect(() => {
    const handlePopState = () => {
      const { view, id } = parsePath(window.location.pathname);
      setCurrentView(view);
      setSelectedProductId(id);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Rutas protegidas: sin permisos se vuelve al inicio
  useEffect(() => {
    if (isAdminView(currentView) && user?.rol !== 'admin') setCurrentView('home');
    if (currentView === 'profile' && !user) setCurrentView('home');
  }, [currentView, user]);

  const handleNavigate = (view, prefill = null) => {
    if (isAdminView(view) && user?.rol !== 'admin') {
      if (!user) {
        setIsLoginOpen(true);
        return;
      }
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'profile' && !user) {
      setIsLoginOpen(true);
      return;
    }

    setContactPrefill(view === 'contact' ? prefill : null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = (orderCart, total) => {
    const userId = user?._id || user?.id;
    if (userId) {
      try {
        const key = `${ORDERS_KEY_PREFIX}${userId}`;
        const previous = JSON.parse(localStorage.getItem(key) || '[]');
        const order = {
          id: Date.now(),
          date: new Date().toISOString(),
          items: orderCart.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            quantity: item.quantity,
            precio: item.precio
          })),
          total
        };
        localStorage.setItem(key, JSON.stringify([order, ...previous]));
      } catch (storageError) {
        console.error('No se pudo guardar el historial de pedidos:', storageError);
      }
    }

    setCart([]);
    setIsCartOpen(false);
    setToastMessage('Recibimos tu pedido. El taller te contactará para coordinar el despacho.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadProducts = async () => {
    const data = await productService.getProducts();
    setProducts(data);
    return data;
  };

  const handleProductCreated = async (created) => {
    await reloadProducts();
    setToastMessage(`Se agregó ${created?.nombre || 'el mueble'} al catálogo.`);
    setTimeout(() => setToastMessage(null), 4000);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    setIsLoginOpen(false);
    setCurrentView(nextUser.rol === 'admin' ? 'admin' : 'profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        );
      case 'catalog':
        return (
          <CatalogPage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'detail':
        return (
          <DetailPage
            productId={selectedProductId}
            onBack={() => handleNavigate('catalog')}
            onAddToCart={handleAddToCart}
            onSelectRelated={handleSelectProduct}
          />
        );
      case 'contact':
        return <ContactPage prefill={contactPrefill} />;
      case 'admin-create':
        return user?.rol === 'admin'
          ? <AdminCreateProductPage onCreated={handleProductCreated} onCancel={() => handleNavigate('admin')} />
          : null;
      case 'admin':
        return user?.rol === 'admin'
          ? <AdminPage products={products} onProductsChange={reloadProducts} onNavigate={handleNavigate} />
          : (
            <HomePage
              products={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          );
      case 'profile':
        return user
          ? (
            <UserProfilePage
              user={user}
              onUserUpdate={setUser}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )
          : (
            <HomePage
              products={products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          );
      default:
        return (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar
        cartCount={totalCartCount}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <div className="app-view-container">
        {renderCurrentView()}
      </div>

      <Footer onNavigate={handleNavigate}
      user={user}
      onOpenLogin={() => setIsLoginOpen(true)} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {toastMessage && (
        <div className="toast-container" aria-live="polite">
          <div className="custom-toast" style={{
            backgroundColor: 'var(--siena-tostado)',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000
          }}>
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
