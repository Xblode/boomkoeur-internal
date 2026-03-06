'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button, Input, Label } from '@/components/ui/atoms';
import { Upload, Loader2, Euro } from 'lucide-react';
import {
  getEventPosProducts,
  getEventPosCashTotal,
  upsertEventPosCashTotal,
  bulkCreateEventPosSales,
} from '@/lib/supabase/eventPos';
import type { EventPosProductWithVariants } from '@/types/eventPos';
import { ImportSalesCsvModal } from './modals/ImportSalesCsvModal';
import { toast } from 'sonner';

interface PosSalesImportProps {
  eventId: string;
  eventDate: string;
  /** Masquer la card Import CSV (utilisée quand le bouton est dans la toolbar) */
  hideImportCard?: boolean;
}

export function PosSalesImport({ eventId, eventDate, hideImportCard }: PosSalesImportProps) {
  const [products, setProducts] = useState<EventPosProductWithVariants[]>([]);
  const [cashTotal, setCashTotal] = useState<number | null>(null);
  const [cashNotes, setCashNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cash] = await Promise.all([
        getEventPosProducts(eventId),
        getEventPosCashTotal(eventId),
      ]);
      setProducts(prods);
      setCashTotal(cash?.total_amount ?? null);
      setCashNotes(cash?.notes ?? '');
    } catch {
      setProducts([]);
      setCashTotal(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCash = async () => {
    setSaving(true);
    try {
      await upsertEventPosCashTotal(eventId, cashTotal ?? 0, cashNotes || null);
      toast.success('Total cash enregistré');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hideImportCard && (
        <Card variant="outline">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Import ventes CB (SumUp)</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload size={14} className="mr-1.5" />
              Importer CSV
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Exportez vos ventes depuis me.sumup.com (Ventes / Transactions) et importez le CSV pour
              enregistrer les ventes par carte.
            </p>
          </CardContent>
        </Card>
      )}

      <Card variant="outline">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Euro size={18} />
            Total cash
          </CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveCash}
            disabled={saving || (cashTotal ?? 0) < 0}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Saisissez le montant total des ventes en espèces. Les pertes seront estimées par
            répartition proportionnelle aux ventes CB.
          </p>
          <div>
            <Label htmlFor="cash-total">Montant (€)</Label>
            <Input
              id="cash-total"
              type="number"
              step="0.01"
              min="0"
              value={cashTotal ?? ''}
              onChange={(e) =>
                setCashTotal(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="cash-notes">Notes</Label>
            <Input
              id="cash-notes"
              value={cashNotes}
              onChange={(e) => setCashNotes(e.target.value)}
              placeholder="Optionnel"
            />
          </div>
        </CardContent>
      </Card>

      <ImportSalesCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        eventId={eventId}
        products={products}
        defaultDate={eventDate}
        onSuccess={() => {
          setImportModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
