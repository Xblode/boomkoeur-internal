"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Product, ProductVariant, StockMovement } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';

interface ProductDetailContextValue {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  persistField: (updates: Partial<Product>) => void;
  reloadProduct: () => Promise<void>;
  variants: ProductVariant[];
  reloadVariants: () => Promise<void>;
  stockMovements: StockMovement[];
  reloadStockMovements: () => Promise<void>;
}

const ProductDetailContext = createContext<ProductDetailContextValue | null>(null);

export function useProductDetail() {
  const ctx = useContext(ProductDetailContext);
  if (!ctx) throw new Error('useProductDetail must be used within ProductDetailProvider');
  return ctx;
}

interface ProductDetailProviderProps {
  initialProduct: Product;
  children: React.ReactNode;
  onError?: (error: string | null) => void;
}

export function ProductDetailProvider({ initialProduct, children, onError }: ProductDetailProviderProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const persistField = useCallback((updates: Partial<Product>) => {
    setProduct(prev => {
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      productDataService.updateProduct(prev.id, updates);
      return updated;
    });
  }, []);

  const reloadProduct = useCallback(async () => {
    const fresh = await productDataService.getProductById(product.id);
    if (fresh) setProduct(fresh);
  }, [product.id]);

  const reloadVariants = useCallback(async () => {
    try {
      const data = await productDataService.getVariants(product.id);
      setVariants(data);
      onError?.(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(msg);
    }
  }, [product.id, onError]);

  const reloadStockMovements = useCallback(async () => {
    try {
      const data = await productDataService.getStockMovements({ productId: product.id });
      setStockMovements(data);
      onError?.(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(msg);
    }
  }, [product.id, onError]);

  useEffect(() => {
    reloadVariants();
    reloadStockMovements();
  }, [reloadVariants, reloadStockMovements]);

  const value = useMemo(
    () => ({ product, setProduct, persistField, reloadProduct, variants, reloadVariants, stockMovements, reloadStockMovements }),
    [product, persistField, reloadProduct, variants, reloadVariants, stockMovements, reloadStockMovements]
  );

  return (
    <ProductDetailContext.Provider value={value}>
      {children}
    </ProductDetailContext.Provider>
  );
}
