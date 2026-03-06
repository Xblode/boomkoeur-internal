'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/organisms';
import { Button } from '@/components/ui/atoms';
import { Plus, Loader2 } from 'lucide-react';
import { getEventPosVariants } from '@/lib/supabase/eventPos';
import type { EventPosProductWithVariants, EventPosVariant } from '@/types/eventPos';
import { AddPosVariantModal } from './AddPosVariantModal';

interface ManageVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EventPosProductWithVariants;
  onSuccess: () => void;
}

function formatVariantLabel(v: EventPosVariant): string {
  const parts: string[] = [];
  if (v.size) parts.push(v.size);
  if (v.color) parts.push(v.color);
  if (v.design) parts.push(v.design);
  if (v.container_type) parts.push(v.container_type);
  if (v.sale_unit_cl) parts.push(`${v.sale_unit_cl}cl`);
  return parts.length > 0 ? parts.join(' • ') : 'Sans variante';
}

export function ManageVariantsModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ManageVariantsModalProps) {
  const [variants, setVariants] = useState<EventPosVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchVariants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEventPosVariants(product.id);
      setVariants(data);
    } catch {
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (isOpen) fetchVariants();
  }, [isOpen, fetchVariants]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Variantes — ${product.name}`} size="md">
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={14} className="mr-1.5" />
            Ajouter une variante
          </Button>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              Chargement...
            </div>
          ) : variants.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">
              Aucune variante. Ajoutez des tailles (merch), contenants (boissons) ou laissez vide pour
              un produit sans variante.
            </p>
          ) : (
            <ul className="space-y-2">
              {variants.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium">{formatVariantLabel(v)}</span>
                  {product.has_stock && (
                    <span className="text-xs text-zinc-500">
                      Stock: {v.stock_initial}
                      {v.stock_final != null ? ` → ${v.stock_final}` : ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
      <AddPosVariantModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        product={product}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchVariants();
          onSuccess();
        }}
      />
    </>
  );
}
