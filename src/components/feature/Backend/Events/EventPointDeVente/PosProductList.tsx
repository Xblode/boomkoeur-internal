'use client';

import React, { useState } from 'react';
import type {
  EventPosProductWithVariants,
  EventPosVariant,
  EventPosSale,
  PosCategory,
} from '@/types/eventPos';
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, InlineEdit, Input } from '@/components/ui/atoms';
import { ChevronRight, ChevronDown, Trash2, Plus, Pencil } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/feature/Backend/Finance/shared/components';
import {
  createEventPosVariant,
  deleteEventPosProduct,
  deleteEventPosVariant,
  updateEventPosProduct,
  updateEventPosVariant,
  getPosSaleUnits,
} from '@/lib/supabase/eventPos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES: { value: PosCategory; label: string }[] = [
  { value: 'alcool', label: 'Boissons' },
  { value: 'merch', label: 'Merch' },
  { value: 'billet', label: 'Billet' },
  { value: 'autre', label: 'Autre' },
];

const CATEGORY_LABELS: Record<string, string> = {
  alcool: 'Boissons',
  merch: 'Merch',
  billet: 'Billet',
  autre: 'Autre',
};

const CONTAINER_LABELS: Record<string, string> = {
  fut: 'Fut',
  cubi: 'Cubi',
  bouteille: 'Bouteille',
  canette: 'Canette',
};

/** Fut/cubi en L, bouteille/canette en cl */
const CONTAINER_USE_LITERS: Record<string, boolean> = {
  fut: true,
  cubi: true,
  bouteille: false,
  canette: false,
};

/** Supporte décimal (ex: 33, 33.5 pour canettes en cl). Stockage en cl (integer). */
function parseCapacityInput(containerType: string | null, value: string): number | null {
  const n = parseFloat(String(value).replace(',', '.').trim()) || 0;
  if (n <= 0) return null;
  const useL = containerType ? CONTAINER_USE_LITERS[containerType] : false;
  return useL ? Math.round(n * 100) : Math.round(n);
}

function formatVariantLabel(v: EventPosVariant): string {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.color) parts.push(v.color);
  if (v.design) parts.push(v.design);
  if (v.sale_unit_cl) parts.push(`${v.sale_unit_cl}cl`);
  return parts.length > 0 ? parts.join(' • ') : '—';
}

function getVariantStats(variantId: string, sales: EventPosSale[]) {
  let qty = 0;
  let revenue = 0;
  for (const s of sales) {
    if (s.event_pos_variant_id === variantId) {
      qty += s.quantity;
      revenue += s.total;
    }
  }
  return { qty, revenue };
}

interface PosProductListProps {
  products: EventPosProductWithVariants[];
  eventId: string;
  sales: EventPosSale[];
  onRefresh: () => void;
}

export function PosProductList({ products, eventId, sales, onRefresh }: PosProductListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [productToDelete, setProductToDelete] = useState<EventPosProductWithVariants | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<EventPosVariant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState(false);
  const [addingVariantProductId, setAddingVariantProductId] = useState<string | null>(null);
  const [saleUnits, setSaleUnits] = useState<{ id: string; value_cl: number; label: string }[]>([]);
  const [editingCell, setEditingCell] = useState<{
    productId: string;
    field: string;
    value: string;
  } | null>(null);

  React.useEffect(() => {
    getPosSaleUnits().then((u) =>
      setSaleUnits(u as { id: string; value_cl: number; label: string }[])
    );
  }, []);

  const focusEditableInput = (e: React.MouseEvent) => {
    const input = (e.currentTarget as HTMLElement).querySelector<HTMLInputElement>('input');
    input?.focus();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteEventPosProduct(productToDelete.id);
      toast.success('Produit supprimé');
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;
    setDeletingVariant(true);
    try {
      await deleteEventPosVariant(variantToDelete.id);
      toast.success('Variante supprimée');
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setDeletingVariant(false);
      setVariantToDelete(null);
    }
  };

  const handleUpdateProduct = async (
    p: EventPosProductWithVariants,
    field: string,
    value: string | number | null
  ) => {
    try {
      const updates: Record<string, unknown> = {};
      if (field === 'name') updates.name = String(value).trim();
      if (field === 'category') updates.category = value as PosCategory;
      if (field === 'container_type') {
        updates.container_type = value;
        updates.container_capacity_cl = null; // réinitialiser car unités différentes (L vs cl)
      }
      if (field === 'container_capacity_cl') updates.container_capacity_cl = value === null ? null : Math.max(0, Number(value));
      if (field === 'purchase_price') updates.purchase_price = parseFloat(String(value)) || 0;
      if (field === 'stockIn') {
        const total = parseInt(String(value), 10) || 0;
        if (p.variants.length === 1) {
          await updateEventPosVariant(p.variants[0].id, { stock_initial: total });
        } else if (p.variants.length > 1) {
          const currentTotal = p.variants.reduce((s, v) => s + (v.stock_initial ?? 0), 0);
          if (currentTotal > 0) {
            const ratio = total / currentTotal;
            for (const v of p.variants) {
              await updateEventPosVariant(v.id, {
                stock_initial: Math.max(0, Math.round((v.stock_initial ?? 0) * ratio)),
              });
            }
          }
        }
        onRefresh();
        return;
      }
      if (field === 'stockOut') {
        const total = String(value).trim() === '' || String(value) === '—' ? null : parseInt(String(value), 10) || 0;
        if (p.variants.length === 1) {
          await updateEventPosVariant(p.variants[0].id, { stock_final: total });
        } else if (p.variants.length > 1) {
          if (total === null) {
            for (const v of p.variants) {
              await updateEventPosVariant(v.id, { stock_final: null });
            }
          } else {
            const currentTotal = p.variants.reduce(
              (s, v) => s + (v.stock_final ?? v.stock_initial ?? 0),
              0
            );
            if (currentTotal > 0) {
              const ratio = total / currentTotal;
              for (const v of p.variants) {
                await updateEventPosVariant(v.id, {
                  stock_final: Math.max(0, Math.round(((v.stock_final ?? v.stock_initial ?? 0) * ratio))),
                });
              }
            }
          }
        }
        onRefresh();
        return;
      }
      if (Object.keys(updates).length > 0) {
        await updateEventPosProduct(p.id, updates);
        onRefresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleAddVariant = async (productId: string) => {
    setAddingVariantProductId(productId);
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const variant = await createEventPosVariant(productId, {
        price: 0,
        stock_initial: 0,
        sale_unit_cl: product.category === 'alcool' ? 25 : null,
        ...(product.category === 'alcool' && product.container_type && { container_type: product.container_type }),
      });
      toast.success('Variante ajoutée');
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAddingVariantProductId(null);
    }
  };

  const handleSaveVariant = async (
    v: EventPosVariant,
    data: { sale_unit_cl?: number | null; price: number; stock_initial: number }
  ) => {
    try {
      await updateEventPosVariant(v.id, data);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="divide-y divide-border-custom">
      {/* En-tête colonnes */}
      <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-border-custom">
        <div className="w-5 shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-[minmax(160px,220px)_116px_110px_82px_98px_82px_82px] gap-2">
          <span className="px-2">Nom</span>
          <span className="px-2">Catégorie</span>
          <span className="px-2">Contenant</span>
          <span className="px-2">Capacité</span>
          <span className="px-2">Prix achat</span>
          <span className="px-2">Stock In</span>
          <span className="px-2">Stock Out</span>
        </div>
        <div className="w-6 shrink-0" />
      </div>

      {products.map((p) => {
        const isExpanded = expandedIds.has(p.id);
        const stockInTotal = p.variants.reduce((s, v) => s + (v.stock_initial ?? 0), 0);
        const purchasePrice = (p as { purchase_price?: number }).purchase_price ?? p.price ?? 0;

        return (
          <div key={p.id}>
            {/* Ligne produit */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 transition-colors cursor-pointer',
                isExpanded && 'border-b border-border-custom'
              )}
              onClick={() => toggleExpand(p.id)}
            >
              <button
                type="button"
                className="shrink-0 p-0.5 rounded text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(p.id);
                }}
                aria-label={isExpanded ? 'Replier' : 'Déplier'}
              >
                <ChevronRight
                  size={18}
                  className={cn('transition-transform', isExpanded && 'rotate-90')}
                />
              </button>

              <div className="flex-1 min-w-0 grid grid-cols-[minmax(160px,220px)_116px_110px_82px_98px_82px_82px] gap-2 items-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    focusEditableInput(e);
                  }}
                  className="group/cell flex items-center justify-between min-w-0 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 -mx-1.5 -my-0.5 cursor-text"
                >
                  <InlineEdit
                    variant="table"
                    value={
                      editingCell?.productId === p.id && editingCell?.field === 'name'
                        ? editingCell.value
                        : p.name
                    }
                    onChange={(e) =>
                      setEditingCell((prev) =>
                        prev?.productId === p.id && prev?.field === 'name'
                          ? { ...prev, value: e.target.value }
                          : { productId: p.id, field: 'name', value: e.target.value }
                      )
                    }
                    onFocus={() =>
                      setEditingCell((prev) =>
                        prev?.productId === p.id && prev?.field === 'name'
                          ? prev
                          : { productId: p.id, field: 'name', value: p.name }
                      )
                    }
                    onBlur={() => {
                      if (editingCell?.productId === p.id && editingCell?.field === 'name') {
                        const trimmed = editingCell.value.trim();
                        if (trimmed !== p.name) handleUpdateProduct(p, 'name', trimmed);
                        setEditingCell(null);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Escape' && setEditingCell(null)}
                    showEditIcon={false}
                    className="min-w-0 font-medium flex-1"
                  />
                  <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="group/cell flex items-center justify-between w-full min-w-0 min-h-8 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 text-left"
                      >
                        <Badge variant="secondary" className="font-normal text-xs shrink-0 !px-1.5 !py-0">
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </Badge>
                        <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="start">
                      {CATEGORIES.map((c) => (
                        <Button
                          key={c.value}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (c.value !== p.category) handleUpdateProduct(p, 'category', c.value);
                          }}
                          className={cn(
                            'w-full justify-start',
                            p.category === c.value && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                          )}
                        >
                          {c.label}
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {p.category === 'alcool' ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="group/cell flex items-center justify-between w-full min-w-0 min-h-8 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 text-left text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="text-xs font-medium">
                            {p.container_type
                              ? CONTAINER_LABELS[p.container_type] ?? p.container_type
                              : '—'}
                          </span>
                          <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1" align="start">
                        {Object.entries(CONTAINER_LABELS).map(([id, label]) => (
                          <Button
                            key={id}
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (id !== p.container_type) handleUpdateProduct(p, 'container_type', id);
                            }}
                            className={cn(
                              'w-full justify-start',
                              p.container_type === id && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                            )}
                          >
                            {label}
                          </Button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    '—'
                  )}
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p.category === 'alcool' && p.container_type) focusEditableInput(e);
                  }}
                  className={cn(
                    'group/cell flex items-center justify-between min-w-0 rounded-md transition-colors px-1.5 py-0.5 -mx-1.5 -my-0.5',
                    p.category === 'alcool' && p.container_type && 'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 cursor-text'
                  )}
                >
                  {p.category === 'alcool' && p.container_type ? (
                    <>
                      <span className="flex items-center gap-0.5 min-w-0 flex-1">
                        <InlineEdit
                          variant="table"
                          value={
                            editingCell?.productId === p.id && editingCell?.field === 'container_capacity_cl'
                              ? editingCell.value
                              : (() => {
                                  const cap = (p as { container_capacity_cl?: number | null }).container_capacity_cl;
                                  if (cap == null) return '';
                                  const useL = CONTAINER_USE_LITERS[p.container_type!];
                                  return useL ? String(cap / 100) : String(cap);
                                })()
                          }
                          onChange={(e) =>
                            setEditingCell((prev) =>
                              prev?.productId === p.id && prev?.field === 'container_capacity_cl'
                                ? { ...prev, value: e.target.value }
                                : { productId: p.id, field: 'container_capacity_cl', value: e.target.value }
                            )
                          }
                          onFocus={() =>
                            setEditingCell((prev) => {
                              const cap = (p as { container_capacity_cl?: number | null }).container_capacity_cl;
                              const useL = p.container_type ? CONTAINER_USE_LITERS[p.container_type] : false;
                              const val = cap != null ? (useL ? String(cap / 100) : String(cap)) : '';
                              return prev?.productId === p.id && prev?.field === 'container_capacity_cl'
                                ? prev
                                : { productId: p.id, field: 'container_capacity_cl', value: val };
                            })
                          }
                          onBlur={() => {
                            if (editingCell?.productId === p.id && editingCell?.field === 'container_capacity_cl') {
                              const parsed = parseCapacityInput(p.container_type, editingCell.value);
                              const current = (p as { container_capacity_cl?: number | null }).container_capacity_cl ?? null;
                              if (parsed !== current) handleUpdateProduct(p, 'container_capacity_cl', parsed);
                              setEditingCell(null);
                            }
                          }}
                          onKeyDown={(e) => e.key === 'Escape' && setEditingCell(null)}
                          showEditIcon={false}
                          placeholder={CONTAINER_USE_LITERS[p.container_type] ? '50' : '33'}
                          className="min-w-0 [&_input]:text-right tabular-nums text-xs"
                        />
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {CONTAINER_USE_LITERS[p.container_type] ? 'L' : 'cl'}
                        </span>
                      </span>
                      <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                    </>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    focusEditableInput(e);
                  }}
                  className="group/cell flex items-center justify-between min-w-0 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 -mx-1.5 -my-0.5 tabular-nums cursor-text"
                >
                  <span className="flex items-center gap-0.5 min-w-0 flex-1 justify-end">
                    <InlineEdit
                      variant="table"
                      value={
                        editingCell?.productId === p.id && editingCell?.field === 'purchase_price'
                          ? editingCell.value
                          : String(purchasePrice)
                      }
                      onChange={(e) =>
                        setEditingCell((prev) =>
                          prev?.productId === p.id && prev?.field === 'purchase_price'
                            ? { ...prev, value: e.target.value }
                            : { productId: p.id, field: 'purchase_price', value: e.target.value }
                        )
                      }
                      onFocus={() =>
                        setEditingCell((prev) =>
                          prev?.productId === p.id && prev?.field === 'purchase_price'
                            ? prev
                            : { productId: p.id, field: 'purchase_price', value: String(purchasePrice) }
                        )
                      }
                      onBlur={() => {
                        if (editingCell?.productId === p.id && editingCell?.field === 'purchase_price') {
                          const newVal = parseFloat(String(editingCell.value).replace(',', '.')) || 0;
                          if (newVal !== purchasePrice) handleUpdateProduct(p, 'purchase_price', newVal);
                          setEditingCell(null);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Escape' && setEditingCell(null)}
                      showEditIcon={false}
                      className="min-w-0 [&_input]:text-right tabular-nums text-sm"
                    />
                    <span className="text-xs text-zinc-400 shrink-0">€</span>
                  </span>
                  <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p.has_stock && p.variants.length > 0) focusEditableInput(e);
                  }}
                  className="group/cell flex items-center justify-between min-w-0 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 -mx-1.5 -my-0.5 tabular-nums cursor-text"
                >
                  {p.has_stock && p.variants.length > 0 ? (
                    <>
                      <span className="flex min-w-0 flex-1 justify-end">
                        <InlineEdit
                          variant="table"
                          value={
                            editingCell?.productId === p.id && editingCell?.field === 'stockIn'
                              ? editingCell.value
                              : String(stockInTotal)
                          }
                          onChange={(e) =>
                            setEditingCell((prev) =>
                              prev?.productId === p.id && prev?.field === 'stockIn'
                                ? { ...prev, value: e.target.value }
                                : { productId: p.id, field: 'stockIn', value: e.target.value }
                            )
                          }
                          onFocus={() =>
                            setEditingCell((prev) =>
                              prev?.productId === p.id && prev?.field === 'stockIn'
                                ? prev
                                : { productId: p.id, field: 'stockIn', value: String(stockInTotal) }
                            )
                          }
                          onBlur={() => {
                            if (editingCell?.productId === p.id && editingCell?.field === 'stockIn') {
                              const newVal = parseInt(String(editingCell.value), 10) || 0;
                              if (newVal !== stockInTotal) handleUpdateProduct(p, 'stockIn', newVal);
                              setEditingCell(null);
                            }
                          }}
                          onKeyDown={(e) => e.key === 'Escape' && setEditingCell(null)}
                          showEditIcon={false}
                          className="min-w-0 [&_input]:text-right tabular-nums text-sm"
                        />
                      </span>
                      <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                    </>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (p.has_stock && p.variants.length > 0) focusEditableInput(e);
                  }}
                  className="group/cell flex items-center justify-between min-w-0 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors px-1.5 py-0.5 -mx-1.5 -my-0.5 tabular-nums text-sm cursor-text"
                >
                  {p.has_stock && p.variants.length > 0 ? (
                    (() => {
                      const stockOutTotal = p.variants.reduce(
                        (s, v) => s + (v.stock_final ?? 0),
                        0
                      );
                      const allNull = p.variants.every((v) => v.stock_final == null);
                      const displayValue = allNull ? '0' : String(stockOutTotal);
                      return (
                        <>
                          <span className="flex min-w-0 flex-1 justify-end">
                            <InlineEdit
                              variant="table"
                              value={
                                editingCell?.productId === p.id && editingCell?.field === 'stockOut'
                                  ? editingCell.value
                                  : displayValue
                              }
                              onChange={(e) =>
                                setEditingCell((prev) =>
                                  prev?.productId === p.id && prev?.field === 'stockOut'
                                    ? { ...prev, value: e.target.value }
                                    : { productId: p.id, field: 'stockOut', value: e.target.value }
                                )
                              }
                              onFocus={() =>
                                setEditingCell((prev) =>
                                  prev?.productId === p.id && prev?.field === 'stockOut'
                                    ? prev
                                    : {
                                        productId: p.id,
                                        field: 'stockOut',
                                        value: displayValue,
                                      }
                                )
                              }
                              onBlur={() => {
                                if (editingCell?.productId === p.id && editingCell?.field === 'stockOut') {
                                  const raw = String(editingCell.value).trim();
                                  const isEmpty = raw === '' || raw === '—';
                                  const newVal = isEmpty ? null : parseInt(raw, 10) || 0;
                                  const allNull = p.variants.every((v) => v.stock_final == null);
                                  const currentVal = allNull ? null : p.variants.reduce((s, v) => s + (v.stock_final ?? 0), 0);
                                  const hasChanged = newVal !== currentVal;
                                  if (hasChanged) handleUpdateProduct(p, 'stockOut', isEmpty ? '—' : newVal);
                                  setEditingCell(null);
                                }
                              }}
                              onKeyDown={(e) => e.key === 'Escape' && setEditingCell(null)}
                              showEditIcon={false}
                              placeholder="0"
                              className="min-w-0 [&_input]:text-right tabular-nums text-sm"
                            />
                          </span>
                          <Pencil size={11} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />
                        </>
                      );
                    })()
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-400 dark:hover:bg-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProductToDelete(p)}
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Supprimer
                  </Button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Zone variantes (dépliée) */}
            {isExpanded && (
              <div className="border-t border-border-custom px-4 py-4 pl-12">
                {p.variants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <p className="text-sm text-zinc-500">Aucune variante. Ajoutez-en une pour configurer les formats de vente.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddVariant(p.id);
                      }}
                      disabled={addingVariantProductId === p.id}
                    >
                      <Plus size={14} className="mr-1.5" />
                      Ajouter une variante
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {p.variants.map((v) => {
                      const stats = getVariantStats(v.id, sales);
                      const variantSales = sales.filter((s) => s.event_pos_variant_id === v.id);

                      return (
                        <PosVariantCard
                          key={v.id}
                          variant={v}
                          product={p}
                          sales={stats}
                          variantSales={variantSales}
                          saleUnits={saleUnits}
                          onUpdate={(data) => handleSaveVariant(v, data)}
                          onDelete={() => setVariantToDelete(v)}
                        />
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddVariant(p.id);
                      }}
                      disabled={addingVariantProductId === p.id}
                      className="w-full"
                    >
                      <Plus size={14} className="mr-1.5" />
                      Ajouter une variante
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Supprimer le produit"
        description="Êtes-vous sûr de vouloir supprimer ce produit ? Les variantes et ventes associées seront également supprimées."
        isLoading={deleting}
      />

      <ConfirmDeleteModal
        isOpen={!!variantToDelete}
        onClose={() => setVariantToDelete(null)}
        onConfirm={handleDeleteVariant}
        title="Supprimer la variante"
        description="Êtes-vous sûr de vouloir supprimer cette variante ?"
        isLoading={deletingVariant}
      />
    </div>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  card: 'CB',
  cash: 'Espèces',
};

interface PosVariantCardProps {
  variant: EventPosVariant;
  product: EventPosProductWithVariants;
  sales: { qty: number; revenue: number };
  variantSales: EventPosSale[];
  saleUnits: { id: string; value_cl: number; label: string }[];
  onUpdate: (data: { sale_unit_cl?: number | null; price: number; stock_initial: number }) => void;
  onDelete: () => void;
}

function PosVariantCard({
  variant,
  product,
  sales,
  variantSales,
  saleUnits,
  onUpdate,
  onDelete,
}: PosVariantCardProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saleUnitPopoverOpen, setSaleUnitPopoverOpen] = useState(false);
  const [transactionsExpanded, setTransactionsExpanded] = useState(false);

  const handleBlur = (field: string) => {
    if (editingField !== field) return;
    const val = editValue;
    setEditingField(null);
    if (field === 'price') {
      const price = parseFloat(val.replace(',', '.')) || 0;
      if (price !== (variant.price ?? 0)) {
        onUpdate({
          sale_unit_cl: product.category === 'alcool' ? variant.sale_unit_cl ?? null : null,
          price,
          stock_initial: variant.stock_initial ?? 0,
        });
      }
    } else if (field === 'stock_initial') {
      const stock = parseInt(val, 10) || 0;
      if (stock !== (variant.stock_initial ?? 0)) {
        onUpdate({
          sale_unit_cl: product.category === 'alcool' ? variant.sale_unit_cl ?? null : null,
          price: variant.price ?? 0,
          stock_initial: stock,
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border-custom bg-card-bg group/card">
      <div className="flex items-center gap-4 flex-wrap">
      {variantSales.length > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTransactionsExpanded((prev) => !prev);
          }}
          className="shrink-0 p-0.5 rounded text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
          aria-label={transactionsExpanded ? 'Replier' : 'Déplier'}
        >
          <ChevronRight
            size={18}
            className={cn('transition-transform', transactionsExpanded && 'rotate-90')}
          />
        </button>
      )}
      {product.category === 'alcool' ? (
        <Popover open={saleUnitPopoverOpen} onOpenChange={setSaleUnitPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-custom bg-bg px-2.5 py-1 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {variant.sale_unit_cl ? `${variant.sale_unit_cl}cl` : '—'}
              <ChevronDown size={14} className="text-zinc-400 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start">
            {saleUnits.map((u) => (
              <Button
                key={u.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const cl = u.value_cl;
                  if (cl !== (variant.sale_unit_cl ?? 0)) {
                    onUpdate({
                      sale_unit_cl: product.category === 'alcool' ? cl : null,
                      price: variant.price ?? 0,
                      stock_initial: variant.stock_initial ?? 0,
                    });
                  }
                  setSaleUnitPopoverOpen(false);
                }}
                className={cn(
                  'w-full justify-start',
                  (variant.sale_unit_cl ?? 0) === u.value_cl && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                )}
              >
                {u.label}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      ) : (
        <span className="font-medium text-sm">{formatVariantLabel(variant)}</span>
      )}

      <div className="flex items-center gap-1">
        <Input
          type="text"
          inputMode="decimal"
          size="sm"
          value={editingField === 'price' ? editValue : String(variant.price ?? 0)}
          onChange={(e) => {
            setEditingField('price');
            setEditValue(e.target.value);
          }}
          onFocus={() => {
            setEditingField('price');
            setEditValue(String(variant.price ?? 0));
          }}
          onBlur={() => handleBlur('price')}
          onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
          className="text-sm tabular-nums min-w-[3.5rem] w-16 text-right"
        />
        <span className="text-xs text-zinc-400 shrink-0">€</span>
      </div>

      {product.has_stock && product.container_type !== 'fut' && product.container_type !== 'cubi' && (
        <div className="flex items-center gap-2 min-w-[5rem]">
          <span className="text-xs text-zinc-500 shrink-0">Stock In:</span>
          <InlineEdit
            variant="table"
            value={editingField === 'stock_initial' ? editValue : String(variant.stock_initial ?? 0)}
            onChange={(e) => {
              setEditingField('stock_initial');
              setEditValue(e.target.value);
            }}
            onFocus={() => {
              setEditingField('stock_initial');
              setEditValue(String(variant.stock_initial ?? 0));
            }}
            onBlur={() => handleBlur('stock_initial')}
            onKeyDown={(e) => e.key === 'Escape' && setEditingField(null)}
            showEditIcon={false}
            className="text-sm tabular-nums min-w-[3.5rem] [&_input]:text-right flex-1"
          />
        </div>
      )}

      <div className="flex items-center gap-6 ml-auto shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Vendus</span>
          <span className="text-base font-semibold tabular-nums text-foreground">{sales.qty}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">CA</span>
          <span className="text-base font-semibold tabular-nums text-foreground">{sales.revenue.toFixed(2)} €</span>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="ml-auto p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 size={14} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 size={14} className="mr-2" />
            Supprimer
          </Button>
        </PopoverContent>
      </Popover>
      </div>
      {transactionsExpanded && variantSales.length > 0 && (
        <div className="w-full mt-2 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-1.5">
          <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide mb-1">
            Transactions
          </div>
          {variantSales.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 text-xs py-1 px-2 rounded bg-zinc-50 dark:bg-zinc-900/50"
            >
              <span className="tabular-nums">
                {s.quantity} × {s.unit_price.toFixed(2)} € = {s.total.toFixed(2)} €
              </span>
              <span className="text-zinc-500">
                {s.sale_time ?? '—'} · {PAYMENT_LABELS[s.payment_type] ?? s.payment_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
