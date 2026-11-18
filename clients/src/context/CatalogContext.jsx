import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { productService } from '../services/productService';
import { getProductId } from '../utils/inventory';

const CatalogContext = createContext(null);

/** Catálogo compartido: la tienda y el panel leen y actualizan la misma lista de productos. */
export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const createProduct = useCallback(async (payload) => {
    const created = await productService.createProduct(payload);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id, payload) => {
    const updated = await productService.updateProduct(id, payload);
    setProducts((prev) => prev.map((item) => (getProductId(item) === id ? { ...item, ...updated } : item)));
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await productService.deleteProduct(id);
    setProducts((prev) => prev.filter((item) => getProductId(item) !== id));
  }, []);

  const value = useMemo(
    () => ({ products, isLoading, error, reload, createProduct, updateProduct, deleteProduct }),
    [products, isLoading, error, reload, createProduct, updateProduct, deleteProduct]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog debe usarse dentro de <CatalogProvider>.');
  return context;
};
