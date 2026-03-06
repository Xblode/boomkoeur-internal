/**
 * Types pour le module Point de Vente (Event POS)
 */

export type PosCategory = 'alcool' | 'merch' | 'billet';

export type PosContainerType = 'fut' | 'cubi' | 'bouteille' | 'canette';

export type PosPaymentType = 'card' | 'cash';

export type PosSaleSource = 'import_csv' | 'manual';

export interface PosContainerTypeRef {
  id: string;
  label: string;
  sort_order: number;
}

export interface PosSaleUnit {
  id: string;
  value_cl: number;
  label: string;
  is_custom: boolean;
  org_id: string | null;
}

export interface EventPosProduct {
  id: string;
  event_id: string;
  name: string;
  category: PosCategory;
  container_type: string | null;
  container_capacity_cl?: number | null;
  purchase_price: number;
  price: number;
  product_id: string | null;
  has_stock: boolean;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventPosVariant {
  id: string;
  event_pos_product_id: string;
  /** Merch */
  size?: string | null;
  color?: string | null;
  design?: string | null;
  container_type?: string | null;
  sale_unit_cl?: number | null;
  sale_unit_id?: string | null;
  /** Prix de vente (par variante) */
  price: number;
  /** Stock */
  stock_initial: number;
  stock_final?: number | null;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventPosSale {
  id: string;
  event_id: string;
  event_pos_product_id: string;
  event_pos_variant_id: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  payment_type: PosPaymentType;
  source: PosSaleSource;
  reference?: string | null;
  sale_date: string;
  org_id: string;
  created_at: string;
}

export interface EventPosCashTotal {
  id: string;
  event_id: string;
  total_amount: number;
  notes?: string | null;
  org_id: string;
  created_at: string;
}

export interface EventPosProductWithVariants extends EventPosProduct {
  variants: EventPosVariant[];
}

export interface EventPosProductInput {
  name: string;
  category: PosCategory;
  container_type?: string | null;
  container_capacity_cl?: number | null;
  purchase_price?: number;
  price?: number;
  product_id?: string | null;
  has_stock?: boolean;
}

export interface EventPosVariantInput {
  /** Merch */
  size?: string | null;
  color?: string | null;
  design?: string | null;
  container_type?: string | null;
  sale_unit_cl?: number | null;
  sale_unit_id?: string | null;
  price?: number;
  stock_initial?: number;
}

export interface EventPosSaleInput {
  event_pos_product_id: string;
  event_pos_variant_id?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  payment_type: PosPaymentType;
  source: PosSaleSource;
  reference?: string | null;
  sale_date: string;
}
