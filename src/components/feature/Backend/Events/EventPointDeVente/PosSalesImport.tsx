'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button, Input, Label } from '@/components/ui/atoms';
import { Upload, Loader2, Euro, Receipt, Plus, Trash2 } from 'lucide-react';
import {
  getEventPosProducts,
  getEventPosCashRegisters,
  upsertEventPosCashRegisters,
} from '@/lib/supabase/eventPos';
import type { EventPosProductWithVariants } from '@/types/eventPos';
import { ImportSalesCsvModal } from './modals/ImportSalesCsvModal';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { toast } from 'sonner';

interface PosSalesImportProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  /** Masquer la card Import CSV (utilisée quand le bouton est dans la toolbar) */
  hideImportCard?: boolean;
}

interface RegisterForm {
  id?: string;
  name: string;
  initial_amount: number;
  closing_amount: number;
  notes?: string | null;
}

export function PosSalesImport({ eventId, eventName, eventDate, hideImportCard }: PosSalesImportProps) {
  const [products, setProducts] = useState<EventPosProductWithVariants[]>([]);
  const [registers, setRegisters] = useState<RegisterForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cashRegisters] = await Promise.all([
        getEventPosProducts(eventId),
        getEventPosCashRegisters(eventId),
      ]);
      setProducts(prods);
      if (cashRegisters.length > 0) {
        setRegisters(
          cashRegisters.map((r) => ({
            id: r.id,
            name: r.name,
            initial_amount: r.initial_amount,
            closing_amount: r.closing_amount,
            notes: r.notes,
          }))
        );
      } else {
        setRegisters([{ name: 'Caisse', initial_amount: 0, closing_amount: 0 }]);
      }
    } catch {
      setProducts([]);
      setRegisters([{ name: 'Caisse', initial_amount: 0, closing_amount: 0 }]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalClosing = registers.reduce((s, r) => s + (r.closing_amount ?? 0), 0);

  const handleSaveCash = async () => {
    setSaving(true);
    try {
      await upsertEventPosCashRegisters(
        eventId,
        registers.map((r) => ({
          id: r.id,
          name: r.name || 'Caisse',
          initial_amount: r.initial_amount ?? 0,
          closing_amount: r.closing_amount ?? 0,
          notes: r.notes,
        }))
      );
      toast.success('Caisses enregistrées');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCashTransaction = async () => {
    if (totalClosing <= 0) {
      toast.error('Saisissez les totaux des caisses pour créer la transaction');
      return;
    }
    setCreatingTransaction(true);
    try {
      const dateStr = eventDate.slice(0, 10);
      const labels = registers.filter((r) => (r.closing_amount ?? 0) > 0).map((r) => r.name);
      await financeDataService.createTransaction({
        type: 'income',
        date: dateStr,
        label: `Point de vente cash — ${eventName}${labels.length > 0 ? ` (${labels.join(', ')})` : ''}`,
        amount: totalClosing,
        category: 'Bar',
        vat_applicable: false,
        status: 'pending',
        fiscal_year: new Date(dateStr).getFullYear(),
        reconciled: false,
        event_id: eventId,
      });
      toast.success(`Transaction cash créée : ${totalClosing.toFixed(2)} €`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setCreatingTransaction(false);
    }
  };

  const addRegister = () => {
    setRegisters((prev) => [
      ...prev,
      { name: `Caisse ${prev.length + 1}`, initial_amount: 0, closing_amount: 0 },
    ]);
  };

  const removeRegister = (index: number) => {
    if (registers.length <= 1) return;
    setRegisters((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRegister = (index: number, field: keyof RegisterForm, value: string | number) => {
    setRegisters((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
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
            Caisses (espèces)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateCashTransaction}
              disabled={creatingTransaction || totalClosing <= 0}
            >
              {creatingTransaction ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Création...
                </>
              ) : (
                <>
                  <Receipt size={14} className="mr-1.5" />
                  Créer une transaction
                </>
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCash}
              disabled={saving}
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Gérez plusieurs caisses (entrée, bar, etc.). Pour chaque caisse : fond de caisse au départ, total
            compté en fin. Les pertes sont estimées par répartition proportionnelle aux ventes CB.
          </p>
          <div className="space-y-4">
            {registers.map((r, i) => (
              <div
                key={r.id ?? i}
                className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-border-custom bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <div className="flex-1 min-w-[120px]">
                  <Label>Nom (ex: Entrée, Bar)</Label>
                  <Input
                    value={r.name}
                    onChange={(e) => updateRegister(i, 'name', e.target.value)}
                    placeholder="Caisse"
                  />
                </div>
                <div className="w-24">
                  <Label>Fond (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={r.initial_amount ?? ''}
                    onChange={(e) =>
                      updateRegister(i, 'initial_amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="w-24">
                  <Label>Total fin (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={r.closing_amount ?? ''}
                    onChange={(e) =>
                      updateRegister(i, 'closing_amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRegister(i)}
                  disabled={registers.length <= 1}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRegister}>
              <Plus size={14} className="mr-1.5" />
              Ajouter une caisse
            </Button>
          </div>
          {registers.length > 0 && (
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Total cash : {totalClosing.toFixed(2)} €
            </p>
          )}
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
