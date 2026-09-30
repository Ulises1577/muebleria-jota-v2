import React from 'react';
import { ProductDetail } from '../components/ProductDetail';

export const DetailPage = ({ productId, onBack, onAddToCart, onSelectRelated }) => {
  return (
    <ProductDetail 
      productId={productId} 
      onBack={onBack} 
      onAddToCart={onAddToCart}
      onSelectRelated={onSelectRelated}
    />
  );
};
