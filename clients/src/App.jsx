import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { DetailPage } from './pages/DetailPage';
import { ContactPage } from './pages/ContactPage';
import { productService } from './services/productService';
import './App.css';

export function App() {
  // 1. Estado de productos y ciclo de vida de la petición a la API (Sprint 3 y 4)
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Estado de navegación y renderizado condicional de vistas
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'catalog' | 'detail' | 'contact'
  const [selectedProductId, setSelectedProductId] = useState(null);

  // 3. Estado del carrito de compras (elevado en App.jsx con persistencia en localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hermanos_jota_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sincronización del carrito con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hermanos_jota_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  // Carga inicial del catálogo consumiendo la API de Express
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

  // Navegación entre vistas
  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selección de producto para detalle condicional
  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Operaciones del Carrito
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

  // Total de unidades para pasar por props a la Navbar
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Renderizado condicional de la vista activa (Requisito Sprint 3 y 4)
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
        return <ContactPage />;
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
      {/* Navbar oficial con contador dinámico vía props */}
      <Navbar
        cartCount={totalCartCount}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Vista renderizada dinámicamente con su semántica original */}
      <div className="app-view-container">
        {renderCurrentView()}
      </div>

      {/* Footer corporativo oficial */}
      <Footer onNavigate={handleNavigate} />

      {/* Modal del Carrito */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
