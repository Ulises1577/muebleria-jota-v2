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

const parsePath = (pathname, allowAdmin = false) => {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/productos') return { view: 'catalog', id: null };
  if (path.startsWith('/productos/')) return { view: 'detail', id: decodeURIComponent(path.split('/')[2]) };
  if (path === '/contacto') return { view: 'contact', id: null };
  if (path === '/admin') return { view: allowAdmin ? 'admin' : 'home', id: null };
  if (path === '/admin/crear-producto') return { view: allowAdmin ? 'admin-create' : 'home', id: null };
  if (path === '/perfil') return { view: 'profile', id: null };
  return { view: 'home', id: null };
};

const isAdminView = (view) => view === 'admin' || view === 'admin-create';

export function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sesión limpia al cargar a menos que haya token válido
  const [user, setUser] = useState(() => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();
      if (!storedToken || !storedUser) return null;
      return storedUser;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => authService.getToken());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Un usuario es admin ÚNICAMENTE si está autenticado con rol admin
  const isUserAdmin = Boolean(user && (user.role === 'admin' || user.rol === 'admin' || user.isAdmin));

  const [currentView, setCurrentView] = useState(() => {
    const initialAdmin = Boolean(user && (user.role === 'admin' || user.rol === 'admin' || user.isAdmin));
    return parsePath(window.location.pathname, initialAdmin).view;
  });

  const [selectedProductId, setSelectedProductId] = useState(() => {
    return parsePath(window.location.pathname, false).id;
  });

  const [contactPrefill, setContactPrefill] = useState(null);

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
      .catch((err) => {
        if (!isMounted) return;
        // Solo se cierra la sesión si el servidor dijo que el token no sirve.
        // Un corte de red o un 500 no deben borrar el token del administrador.
        const tokenRejected = err?.status === 401 || err?.status === 403 || err?.status === 404;
        if (!tokenRejected) return;
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
      const { view, id } = parsePath(window.location.pathname, isUserAdmin);
      setCurrentView(view);
      setSelectedProductId(id);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isUserAdmin]);

  // Rutas protegidas: sin permisos se vuelve al inicio
  useEffect(() => {
    if (isAdminView(currentView) && !isUserAdmin) setCurrentView('home');
    if (currentView === 'profile' && !user) setCurrentView('home');
  }, [currentView, isUserAdmin, user]);

  const handleNavigate = (view, prefill = null) => {
    if (isAdminView(view) && !isUserAdmin) {
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

  const handleCheckout = () => {
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
    setToastMessage(`Se agregó ${created?.nombre || 'el producto'} al catálogo.`);
    setTimeout(() => setToastMessage(null), 4000);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    setIsLoginOpen(false);
    const isNextAdmin = Boolean(nextUser && (nextUser.role === 'admin' || nextUser.rol === 'admin' || nextUser.isAdmin));
    setCurrentView(isNextAdmin ? 'admin' : 'home');
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
        return isUserAdmin
          ? <AdminCreateProductPage onCreated={handleProductCreated} onCancel={() => handleNavigate('admin')} />
          : null;
      case 'admin':
        return isUserAdmin
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
              onLogout={handleLogout}
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
        isAdmin={isUserAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <div className="app-view-container">
        {renderCurrentView()}
      </div>

      <Footer
        onNavigate={handleNavigate}
        user={user}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

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
