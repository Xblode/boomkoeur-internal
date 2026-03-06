'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '@/components/ui/molecules';
import { PageToolbar, PageToolbarActions } from '@/components/ui/organisms';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { useEventDetail } from '../EventDetailProvider';
import { Button } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';
import { EmptyState } from '@/components/ui/molecules';
import { Plus, Loader2, ShoppingBag, Upload, FileSpreadsheet, FileText, Package, Euro, Receipt } from 'lucide-react';
import {
  getEventPosProducts,
  getEventPosSales,
  type EventPosProductWithVariants,
  type EventPosSale,
} from '@/lib/supabase/eventPos';
import { PosProductList } from './PosProductList';
import { PosExportSection } from './PosExportSection';
import { PosSalesImport } from './PosSalesImport';
import { PosSalesChart } from './PosSalesChart';
import { toast } from 'sonner';
import { ImportSalesCsvModal } from './modals/ImportSalesCsvModal';
import { AddPosProductModal } from './modals/AddPosProductModal';
import { financeDataService } from '@/lib/services/FinanceDataService';

function computeMetadata(products: EventPosProductWithVariants[], sales: EventPosSale[]) {
  const totalProducts = products.length;
  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);
  const totalStockIn = products.reduce(
    (s, p) => s + p.variants.reduce((sv, v) => sv + (v.stock_initial ?? 0), 0),
    0
  );
  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalQtySold = sales.reduce((s, x) => s + x.quantity, 0);
  return {
    totalProducts,
    totalVariants,
    totalStockIn,
    totalRevenue,
    totalQtySold,
  };
}

export function EventPointDeVenteSection() {
  const { event } = useEventDetail();
  const [products, setProducts] = useState<EventPosProductWithVariants[]>([]);
  const [sales, setSales] = useState<EventPosSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addConsumableModalOpen, setAddConsumableModalOpen] = useState(false);
  const [addMerchModalOpen, setAddMerchModalOpen] = useState(false);

  const fetchData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const [prods, salesData] = await Promise.all([
        getEventPosProducts(event.id),
        getEventPosSales(event.id),
      ]);
      setProducts(prods);
      setSales(salesData);
    } catch {
      if (!opts?.silent) {
        setProducts([]);
        setSales([]);
      }
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  const totalCbSales = sales.filter((s) => s.payment_type === 'card').reduce((sum, s) => sum + s.total, 0);
  const eventDateStr = new Date(event.date).toISOString().slice(0, 10);

  const handleCreateCbTransaction = useCallback(async () => {
    if (totalCbSales <= 0) {
      toast.error('Aucune vente CB à enregistrer');
      return;
    }
    setCreatingTransaction(true);
    try {
      await financeDataService.createTransaction({
        type: 'income',
        date: eventDateStr,
        label: `Point de vente CB — ${event.name}`,
        amount: totalCbSales,
        category: 'Bar',
        vat_applicable: false,
        status: 'pending',
        fiscal_year: new Date(eventDateStr).getFullYear(),
        reconciled: false,
        event_id: event.id,
      });
      toast.success(`Transaction CB créée : ${totalCbSales.toFixed(2)} €`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setCreatingTransaction(false);
    }
  }, [event.id, event.name, eventDateStr, totalCbSales]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { setToolbar } = useToolbar();
  useEffect(() => {
    setToolbar(
      <PageToolbar
        actions={
          <PageToolbarActions>
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload size={14} className="mr-1.5" />
              Import CSV
            </Button>
            <PosExportSection
              eventId={event.id}
              eventName={event.name}
              variant="toolbar"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateCbTransaction}
              disabled={creatingTransaction || totalCbSales <= 0}
            >
              {creatingTransaction ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Receipt size={14} className="mr-1.5" />
              )}
              Créer une transaction
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddConsumableModalOpen(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Ajouter consommable
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddMerchModalOpen(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Ajouter merch
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => setToolbar(null);
  }, [
    event.id,
    event.name,
    setToolbar,
    handleCreateCbTransaction,
    creatingTransaction,
    totalCbSales,
  ]);

  const metadata = computeMetadata(products, sales);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-zinc-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement des produits...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Point de ventes"
        subtitle="Produits en vente sur place : boissons, merch, billets. Ajoutez vos produits et configurez les variantes."
        metadata={[
          [
            { icon: ShoppingBag, label: 'Produits', value: metadata.totalProducts },
            { icon: Package, label: 'Variantes', value: metadata.totalVariants },
            { icon: Package, label: 'Stock In', value: metadata.totalStockIn },
          ],
          [
            { icon: FileSpreadsheet, label: 'Vendus', value: metadata.totalQtySold },
            { icon: Euro, label: 'CA', value: `${metadata.totalRevenue.toFixed(2)} €` },
          ],
        ]}
        gridColumns="100px 1fr 100px 1fr 100px 1fr"
      />

      {/* Tableau Consommables (alcool, billet, autre) */}
      <Card variant="outline">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border-custom flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Consommables</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Boissons, billets et autres — stock, ventes et pertes
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddConsumableModalOpen(true)}>
              <Plus size={14} className="mr-1.5" />
              Ajouter
            </Button>
          </div>
          {(() => {
            const consumableProducts = products.filter(
              (p) => p.category === 'alcool' || p.category === 'billet' || p.category === 'autre'
            );
            return consumableProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Aucun consommable"
                description="Ajoutez des boissons, billets ou autres produits pour gérer le stock et les ventes."
                variant="compact"
              />
            ) : (
              <PosProductList
                products={consumableProducts}
                eventId={event.id}
                sales={sales}
                onRefresh={() => fetchData({ silent: true })}
              />
            );
          })()}
        </CardContent>
      </Card>

      {/* Tableau Merch */}
      <Card variant="outline">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border-custom flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Merch</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Produits liés au catalogue — stock et quantités vendues par variante
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddMerchModalOpen(true)}>
              <Plus size={14} className="mr-1.5" />
              Ajouter
            </Button>
          </div>
          {(() => {
            const merchProducts = products.filter((p) => p.category === 'merch');
            return merchProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Aucun merch"
                description="Ajoutez des produits merch en les liant au catalogue produits."
                variant="compact"
              />
            ) : (
              <PosProductList
                products={merchProducts}
                eventId={event.id}
                sales={sales}
                onRefresh={() => fetchData({ silent: true })}
              />
            );
          })()}
        </CardContent>
      </Card>

      {sales.length > 0 && (
        <PosSalesChart sales={sales} products={products} event={event} />
      )}

      {products.length > 0 && (
        <PosSalesImport
          eventId={event.id}
          eventName={event.name}
          eventDate={new Date(event.date).toISOString()}
          hideImportCard
        />
      )}

      <ImportSalesCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        eventId={event.id}
        products={products}
        defaultDate={new Date(event.date).toISOString()}
        onSuccess={() => {
          setImportModalOpen(false);
          fetchData({ silent: true });
        }}
      />

      <AddPosProductModal
        isOpen={addConsumableModalOpen}
        onClose={() => setAddConsumableModalOpen(false)}
        eventId={event.id}
        defaultCategory="alcool"
        onSuccess={() => {
          setAddConsumableModalOpen(false);
          fetchData({ silent: true });
        }}
      />

      <AddPosProductModal
        isOpen={addMerchModalOpen}
        onClose={() => setAddMerchModalOpen(false)}
        eventId={event.id}
        defaultCategory="merch"
        requireProductLink
        onSuccess={() => {
          setAddMerchModalOpen(false);
          fetchData({ silent: true });
        }}
      />
    </div>
  );
}
