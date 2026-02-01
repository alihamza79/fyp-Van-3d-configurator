import React, { useState, useEffect } from 'react';
import { useBuildStore } from '../../store/buildStore';
import ProductInstance from '../instances/ProductInstance';
import { v4 as uuidv4 } from 'uuid';
import { useProductStore } from '../../store/productStore';

const Product = ({ productId, view, modelPath, scale, initialPosition, dimensions, vanBounds, yAxisMove }) => {
  const { productInstances, addInstance, removeInstance, setInstances } = useBuildStore();
  const instances = productInstances[productId] || [];

  useEffect(() => {
    if (!productInstances[productId] || productInstances[productId].length === 0) {
      setInstances(productId, [{ id: uuidv4(), position: initialPosition, rotation: 0 }]);
    }
  }, [productId, productInstances, initialPosition, setInstances]);

  const { vanProducts, addProductToVan, removeProductFromVan, toggleProductVisibility } = useProductStore();
  

  const handleCopy = (id, currentPosition) => {
    const newInstance = { id: uuidv4(), position: [currentPosition[0] + 1, currentPosition[1], currentPosition[2]] };
    addInstance(productId, newInstance);
    const product = vanProducts.find(p => p.modelPath === modelPath);
    if (product) {
      addProductToVan({ ...product, quantity: product.quantity + 1 });
    }
  };

  const handleRemove = (id) => {
    removeInstance(productId, id);
    const product = vanProducts.find(p => p.modelPath === modelPath);
    if (product) {
      if (product.quantity === 1) {
        toggleProductVisibility(product.id);
      }
      removeProductFromVan({ ...product, quantity: product.quantity - 1 });
    }
  };

  return (
    <>
      {instances.map((instance) => (
        <ProductInstance
          key={instance.id}
          productId={productId}
          id={instance.id}
          initialPosition={instance.position}
          view={view}
          onCopy={handleCopy}
          onRemove={handleRemove}
          modelPath={modelPath}
          scale={scale}
          dimensions={dimensions}
          vanBounds={vanBounds}
          yAxisMove={yAxisMove}
        />
      ))}
    </>
  );
};

export default Product;