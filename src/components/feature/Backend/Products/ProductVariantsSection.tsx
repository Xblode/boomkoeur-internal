"use client";

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import { useProductDetail } from './ProductDetailProvider';
import { productDataService } from '@/lib/services/ProductDataService';
import { ProductVariant, ProductVariantInput, VariantAvailability } from '@/types/product';
import { Button, Input, Label } from '@/components/ui/atoms';
import { EditableCard } from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Layers,
  AlertCircle,
  Check,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AVAILABILITY_LABELS: Record<VariantAvailability, string> = {
  public: 'Public',
  member: 'Membre',
  partner: 'Partenaire',
};

const AVAILABILITY_COLORS: Record<VariantAvailability, string> = {
  public:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  member:  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  partner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

type EditingData = {
  size: string;
  color: string;
  purchasePrice: string;
  imageUrl: string;
  availableFor: VariantAvailability[];
};

const defaultEditingData = (): EditingData => ({
  size: '',
  color: '',
  purchasePrice: '',
  imageUrl: '',
  availableFor: ['public', 'member', 'partner'],
});

function variantLabel(v: ProductVariant): string {
  if (v.size && v.color) return `${v.size} · ${v.color}`;
  if (v.size) return v.size;
  if (v.color) return v.color;
  return 'Standard';
}

export function ProductVariantsSection() {
  const { product, variants, reloadVariants, reloadProduct } = useProductDetail();
  const { setToolbar } = useToolbar();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>(defaultEditingData());
  const [isAdding, setIsAdding] = useState(false);
  const [addData, setAddData] = useState<EditingData>(defaultEditingData());
  const [isSaving, setIsSaving] = useState(false);

  const isLowStock = (v: ProductVariant) => v.stock < 5;

  // Toolbar
  useEffect(() => {
    setToolbar(
      <PageToolbar
        filters={<PageToolbarFilters />}
        actions={
          <PageToolbarActions>
            <Button onClick={() => { setIsAdding(true); setEditingId(null); }}>
              <Plus className="w-3 h-3 mr-1.5" />
              Nouvelle variante
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => { setToolbar(null); };
  }, [setToolbar]);

  // Toggle edit card
  const toggleEdit = (v: ProductVariant) => {
    if (editingId === v.id) {
      setEditingId(null);
      return;
    }
    setIsAdding(false);
    setEditingId(v.id);
    setEditingData({
      size: v.size || '',
      color: v.color || '',
      purchasePrice: String(v.purchase_price),
      imageUrl: v.images?.[0] || '',
      availableFor: v.available_for || ['public', 'member', 'partner'],
    });
  };

  // Save edit
  const handleSaveEdit = async (variantId: string) => {
    setIsSaving(true);
    try {
      await productDataService.updateVariant(variantId, {
        size: editingData.size || undefined,
        color: editingData.color || undefined,
        purchase_price: parseFloat(editingData.purchasePrice) || 0,
        images: editingData.imageUrl ? [editingData.imageUrl] : [],
        available_for: editingData.availableFor.length > 0 ? editingData.availableFor : undefined,
      });
      await Promise.all([reloadVariants(), reloadProduct()]);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new
  const handleSaveNew = async () => {
    setIsSaving(true);
    try {
      const input: ProductVariantInput = {
        product_id: product.id,
        sku: '',
        size: addData.size || undefined,
        color: addData.color || undefined,
        stock: 0,
        purchase_price: parseFloat(addData.purchasePrice) || 0,
        images: addData.imageUrl ? [addData.imageUrl] : [],
        available_for: addData.availableFor.length > 0 ? addData.availableFor : undefined,
      };
      await productDataService.createVariant(input);
      await Promise.all([reloadVariants(), reloadProduct()]);
      setIsAdding(false);
      setAddData(defaultEditingData());
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async (variantId: string) => {
    if (!confirm('Supprimer cette variante ?')) return;
    await productDataService.deleteVariant(variantId);
    await Promise.all([reloadVariants(), reloadProduct()]);
    if (editingId === variantId) setEditingId(null);
  };

  const toggleAvailability = (
    current: VariantAvailability[],
    type: VariantAvailability,
    setter: (fn: (prev: EditingData) => EditingData) => void
  ) => {
    setter(prev => ({
      ...prev,
      availableFor: prev.availableFor.includes(type)
        ? prev.availableFor.filter(t => t !== type)
        : [...prev.availableFor, type],
    }));
  };

  // ── Shared edit form (inner content only, wrapper provided by EditableCard) ──
  const EditFormContent = ({
    data,
    setData,
    onSave,
    onCancel,
  }: {
    data: EditingData;
    setData: (fn: (prev: EditingData) => EditingData) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 md:col-span-3">
          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Taille</Label>
          <Input
            value={data.size}
            onChange={(e) => setData(prev => ({ ...prev, size: e.target.value }))}
            placeholder="Ex: M, L, XL"
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Couleur</Label>
          <Input
            value={data.color}
            onChange={(e) => setData(prev => ({ ...prev, color: e.target.value }))}
            placeholder="Ex: Noir, Blanc"
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Prix d&apos;achat (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={data.purchasePrice}
            onChange={(e) => setData(prev => ({ ...prev, purchasePrice: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Image URL</Label>
          <Input
            value={data.imageUrl}
            onChange={(e) => setData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <Label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wide">Disponible pour</Label>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(AVAILABILITY_LABELS) as [VariantAvailability, string][]).map(([key, label]) => {
            const isOn = data.availableFor.includes(key);
            return (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAvailability(data.availableFor, key, setData)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  isOn
                    ? AVAILABILITY_COLORS[key] + ' border-transparent'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
                )}
              >
                {isOn && <Check size={11} />}
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="primary" size="sm" disabled={isSaving} onClick={onSave}>
          {isSaving ? 'Enregistrement...' : <><Check size={13} /> Enregistrer</>}
        </Button>
      </div>
    </>
  );

  // ── Empty state ──
  if (variants.length === 0 && !isAdding) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center gap-4 py-12 border border-dashed border-border-custom rounded-lg">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Layers size={28} className="text-zinc-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1">Aucune variante</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              Ajoutez des variantes pour gérer tailles, couleurs et disponibilités.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Ajouter une variante
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionHeader
        icon={<Layers size={28} />}
        title="Variantes"
      />
      {/* ── Variant cards ── */}
      {variants.map((v, index) => {
        const isEditing = editingId === v.id;
        const availability = v.available_for || ['public', 'member', 'partner'];

        return (
          <EditableCard
            key={v.id}
            isEditing={isEditing}
            onEdit={() => toggleEdit(v)}
            onCloseEdit={() => setEditingId(null)}
            onDelete={() => handleDelete(v.id)}
            headerContent={
              <>
                {v.images?.[0] ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-border-custom">
                    <img src={v.images[0]} alt={variantLabel(v)} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-semibold text-xs">
                    {index + 1}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold leading-snug">{variantLabel(v)}</p>
                    <span className="text-xs font-mono text-zinc-400">{v.sku}</span>
                    <span className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      isLowStock(v)
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}>
                      {isLowStock(v) && <AlertCircle size={10} />}
                      {v.stock} unités
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-zinc-500">{v.purchase_price.toFixed(2)}€ achat</span>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <div className="flex gap-1">
                      {availability.map(a => (
                        <span key={a} className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium', AVAILABILITY_COLORS[a])}>
                          {AVAILABILITY_LABELS[a]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            }
            editContent={
              <EditFormContent
                data={editingData}
                setData={setEditingData}
                onSave={() => handleSaveEdit(v.id)}
                onCancel={() => setEditingId(null)}
              />
            }
          />
        );
      })}

      {/* ── Add new variant form ── */}
      {isAdding ? (
        <div className="rounded-lg border border-dashed border-border-custom overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-semibold text-xs">
              {variants.length + 1}
            </div>
            <p className="text-sm font-semibold text-zinc-400">Nouvelle variante</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsAdding(false); setAddData(defaultEditingData()); }}
              className="ml-auto shrink-0 h-7 w-7 p-0"
              aria-label="Annuler"
            >
              <X size={12} />
            </Button>
          </div>
          <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-900/60">
            <EditFormContent
              data={addData}
              setData={setAddData}
              onSave={handleSaveNew}
              onCancel={() => { setIsAdding(false); setAddData(defaultEditingData()); }}
            />
          </div>
        </div>
      ) : (
        /* ── Empty state inline (when variants exist) ── */
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-border-custom text-sm text-zinc-500 hover:text-foreground hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
        >
          <Plus size={16} />
          Ajouter une variante
        </Button>
      )}
    </div>
  );
}
