/**
 * Service Point de Vente (Event POS) - Supabase
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import { addStockMovement } from './products';
import type {
  EventPosProduct,
  EventPosVariant,
  EventPosSale,
  EventPosCashTotal,
  EventPosCashRegister,
  EventPosCashRegisterInput,
  EventPosProductWithVariants,
  EventPosProductInput,
  EventPosVariantInput,
  EventPosSaleInput,
} from '@/types/eventPos';

export type { EventPosProductWithVariants, EventPosSale };

// --- Références ---

export async function getPosContainerTypes() {
  const { data, error } = await supabase
    .from('pos_container_types')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getPosSaleUnits(orgId?: string | null) {
  const oid = orgId ?? getActiveOrgId();
  const { data, error } = await supabase
    .from('pos_sale_units')
    .select('*')
    .or(oid ? `org_id.is.null,org_id.eq.${oid}` : 'org_id.is.null')
    .order('value_cl');
  if (error) throw error;
  return data ?? [];
}

// --- Produits POS ---

export async function getEventPosProducts(eventId: string): Promise<EventPosProductWithVariants[]> {
  const orgId = getActiveOrgId();
  if (!orgId) return [];
  const { data, error } = await supabase
    .from('event_pos_products')
    .select('*')
    .eq('event_id', eventId)
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const products = (data ?? []) as EventPosProduct[];
  const withVariants: EventPosProductWithVariants[] = [];
  for (const p of products) {
    const variants = await getEventPosVariants(p.id);
    withVariants.push({ ...p, variants });
  }
  return withVariants;
}

export async function createEventPosProduct(
  eventId: string,
  input: EventPosProductInput
): Promise<EventPosProduct> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data: eventRow } = await supabase
    .from('events')
    .select('org_id')
    .eq('id', eventId)
    .single();
  if (!eventRow || eventRow.org_id !== orgId) {
    throw new Error('Event non trouvé ou accès refusé');
  }
  const { data, error } = await supabase
    .from('event_pos_products')
    .insert({
      event_id: eventId,
      org_id: orgId,
      name: input.name,
      category: input.category,
      container_type: input.container_type ?? null,
      container_capacity_cl: input.container_capacity_cl ?? null,
      purchase_price: input.purchase_price ?? 0,
      price: input.price ?? 0,
      product_id: input.product_id ?? null,
      has_stock: input.has_stock ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventPosProduct;
}

export async function updateEventPosProduct(
  id: string,
  input: Partial<EventPosProductInput>
): Promise<EventPosProduct> {
  const { data, error } = await supabase
    .from('event_pos_products')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventPosProduct;
}

export async function deleteEventPosProduct(id: string): Promise<void> {
  const { error } = await supabase.from('event_pos_products').delete().eq('id', id);
  if (error) throw error;
}

// --- Variantes ---

export async function getEventPosVariants(productId: string): Promise<EventPosVariant[]> {
  const { data, error } = await supabase
    .from('event_pos_variants')
    .select('*')
    .eq('event_pos_product_id', productId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as EventPosVariant[];
}

export async function createEventPosVariant(
  productId: string,
  input: EventPosVariantInput
): Promise<EventPosVariant> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data: product } = await supabase
    .from('event_pos_products')
    .select('org_id')
    .eq('id', productId)
    .single();
  if (!product || product.org_id !== orgId) throw new Error('Produit non trouvé');
  const { data, error } = await supabase
    .from('event_pos_variants')
    .insert({
      event_pos_product_id: productId,
      org_id: orgId,
      size: input.size ?? null,
      color: input.color ?? null,
      design: input.design ?? null,
      container_type: input.container_type ?? null,
      sale_unit_cl: input.sale_unit_cl ?? null,
      sale_unit_id: input.sale_unit_id ?? null,
      price: input.price ?? 0,
      stock_initial: input.stock_initial ?? 0,
      stock_final: (input as { stock_final?: number | null }).stock_final ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventPosVariant;
}

export async function updateEventPosVariant(
  id: string,
  input: Partial<EventPosVariantInput> & { stock_final?: number | null }
): Promise<EventPosVariant> {
  const update: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('event_pos_variants')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventPosVariant;
}

export async function deleteEventPosVariant(id: string): Promise<void> {
  const { error } = await supabase.from('event_pos_variants').delete().eq('id', id);
  if (error) throw error;
}

// --- Ventes ---

export async function getEventPosSales(eventId: string): Promise<EventPosSale[]> {
  const orgId = getActiveOrgId();
  if (!orgId) return [];
  const { data, error } = await supabase
    .from('event_pos_sales')
    .select('*')
    .eq('event_id', eventId)
    .eq('org_id', orgId)
    .order('sale_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventPosSale[];
}

async function syncPosSaleToProductStock(
  productId: string,
  variantId: string | null,
  quantity: number,
  saleDate: string
): Promise<void> {
  const { data: posProduct } = await supabase
    .from('event_pos_products')
    .select('product_id')
    .eq('id', productId)
    .single();
  if (!posProduct?.product_id) return;

  const { data: posVariant } = variantId
    ? await supabase
        .from('event_pos_variants')
        .select('size, color, design')
        .eq('id', variantId)
        .single()
    : { data: null };

  const { data: pVariants } = await supabase
    .from('product_variants')
    .select('id, size, color, design')
    .eq('product_id', posProduct.product_id);

  const match = (pVariants ?? []).find(
    (v) =>
      (v.size ?? '') === (posVariant?.size ?? '') &&
      (v.color ?? '') === (posVariant?.color ?? '') &&
      (v.design ?? '') === (posVariant?.design ?? '')
  );
  const targetVariantId = match?.id ?? (pVariants?.[0] as { id: string } | undefined)?.id;
  if (!targetVariantId) return;

  await addStockMovement({
    product_id: posProduct.product_id,
    variant_id: targetVariantId,
    type: 'out',
    quantity,
    reason: 'sale',
    reference: 'POS',
    date: saleDate,
  });
}

export async function createEventPosSale(
  eventId: string,
  input: EventPosSaleInput
): Promise<EventPosSale> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data, error } = await supabase
    .from('event_pos_sales')
    .insert({
      event_id: eventId,
      org_id: orgId,
      event_pos_product_id: input.event_pos_product_id,
      event_pos_variant_id: input.event_pos_variant_id ?? null,
      quantity: input.quantity,
      unit_price: input.unit_price,
      total: input.total,
      payment_type: input.payment_type,
      source: input.source,
      reference: input.reference ?? null,
      sale_date: input.sale_date,
      sale_time: input.sale_time ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  syncPosSaleToProductStock(
    input.event_pos_product_id,
    input.event_pos_variant_id ?? null,
    input.quantity,
    input.sale_date
  ).catch(() => {});
  return data as EventPosSale;
}

/** Supprime toutes les ventes importées (source import_csv) pour un event. Utilisé avant réimport pour éviter les doublons. */
export async function deleteEventPosSalesByImportSource(eventId: string): Promise<void> {
  const orgId = getActiveOrgId();
  if (!orgId) return;
  const { error } = await supabase
    .from('event_pos_sales')
    .delete()
    .eq('event_id', eventId)
    .eq('org_id', orgId)
    .eq('source', 'import_csv');
  if (error) throw error;
}

export async function bulkCreateEventPosSales(
  eventId: string,
  inputs: EventPosSaleInput[]
): Promise<EventPosSale[]> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const rows = inputs.map((input) => ({
    event_id: eventId,
    org_id: orgId,
    event_pos_product_id: input.event_pos_product_id,
    event_pos_variant_id: input.event_pos_variant_id ?? null,
    quantity: input.quantity,
    unit_price: input.unit_price,
    total: input.total,
    payment_type: input.payment_type,
    source: input.source,
    reference: input.reference ?? null,
    sale_date: input.sale_date,
    sale_time: input.sale_time ?? null,
  }));
  const { data, error } = await supabase.from('event_pos_sales').insert(rows).select();
  if (error) throw error;
  const sales = (data ?? []) as EventPosSale[];
  for (const s of sales) {
    syncPosSaleToProductStock(
      s.event_pos_product_id,
      s.event_pos_variant_id ?? null,
      s.quantity,
      s.sale_date
    ).catch(() => {});
  }
  return sales;
}

// --- Cash total (legacy, conservé pour compat) ---

export async function getEventPosCashTotal(eventId: string): Promise<EventPosCashTotal | null> {
  const { data, error } = await supabase
    .from('event_pos_cash_totals')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  return data as EventPosCashTotal | null;
}

export async function upsertEventPosCashTotal(
  eventId: string,
  totalAmount: number,
  notes?: string | null
): Promise<EventPosCashTotal> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data, error } = await supabase
    .from('event_pos_cash_totals')
    .upsert(
      {
        event_id: eventId,
        org_id: orgId,
        total_amount: totalAmount,
        notes: notes ?? null,
      },
      { onConflict: 'event_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as EventPosCashTotal;
}

// --- Caisses (multiples, avec fond de caisse) ---

export async function getEventPosCashRegisters(eventId: string): Promise<EventPosCashRegister[]> {
  const orgId = getActiveOrgId();
  if (!orgId) return [];
  const { data, error } = await supabase
    .from('event_pos_cash_registers')
    .select('*')
    .eq('event_id', eventId)
    .eq('org_id', orgId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventPosCashRegister[];
}

export async function createEventPosCashRegister(
  eventId: string,
  input: EventPosCashRegisterInput
): Promise<EventPosCashRegister> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data, error } = await supabase
    .from('event_pos_cash_registers')
    .insert({
      event_id: eventId,
      org_id: orgId,
      name: input.name,
      initial_amount: input.initial_amount ?? 0,
      closing_amount: input.closing_amount ?? 0,
      notes: input.notes ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventPosCashRegister;
}

export async function updateEventPosCashRegister(
  id: string,
  input: Partial<EventPosCashRegisterInput>
): Promise<EventPosCashRegister> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.initial_amount !== undefined) updates.initial_amount = input.initial_amount;
  if (input.closing_amount !== undefined) updates.closing_amount = input.closing_amount;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;
  const { data, error } = await supabase
    .from('event_pos_cash_registers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventPosCashRegister;
}

export async function deleteEventPosCashRegister(id: string): Promise<void> {
  const { error } = await supabase.from('event_pos_cash_registers').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertEventPosCashRegisters(
  eventId: string,
  registers: Array<{ id?: string; name: string; initial_amount: number; closing_amount: number; notes?: string | null }>
): Promise<EventPosCashRegister[]> {
  const existing = await getEventPosCashRegisters(eventId);
  const result: EventPosCashRegister[] = [];
  for (let i = 0; i < registers.length; i++) {
    const r = registers[i];
    if (r.id && existing.some((e) => e.id === r.id)) {
      const updated = await updateEventPosCashRegister(r.id, {
        name: r.name,
        initial_amount: r.initial_amount,
        closing_amount: r.closing_amount,
        notes: r.notes ?? null,
        sort_order: i,
      });
      result.push(updated);
    } else {
      const created = await createEventPosCashRegister(eventId, {
        name: r.name,
        initial_amount: r.initial_amount,
        closing_amount: r.closing_amount,
        notes: r.notes ?? null,
        sort_order: i,
      });
      result.push(created);
    }
  }
  for (const e of existing) {
    if (!registers.some((r) => r.id === e.id)) {
      await deleteEventPosCashRegister(e.id);
    }
  }
  return getEventPosCashRegisters(eventId);
}

