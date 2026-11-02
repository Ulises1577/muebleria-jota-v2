import React from 'react';
import { ProductDetail } from '../components/ProductDetail';

export const DetailPage = ({ productId, onBack, onAddToCart, onSelectRelated, isAdmin, onNavigate }) => {
  return (
    <ProductDetail 
      productId={productId} 
      onBack={onBack} 
      onAddToCart={onAddToCart}
      onSelectRelated={onSelectRelated}
      isAdmin={isAdmin}
      onNavigate={onNavigate}
    />
  );
};