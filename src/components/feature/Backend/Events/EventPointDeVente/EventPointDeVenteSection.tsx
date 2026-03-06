'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '@/components/ui/molecules';
import { PageToolbar, PageToolbarActions } from '@/components/ui/organisms';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { useEventDetail } from '../EventDetailProvider';
import { Button } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';
import { EmptyState } from '@/components/ui/molecules';
import { Plus, Loader2, ShoppingBag, Upload, FileSpreadsheet, FileText, Package, Euro } from 'lucide-react';
import {
  getEventPosProducts,
  getEventPosSales,
  createEventPosProduct,
  createEventPosVariant,
  type EventPosProductWithVariants,
  type EventPosSale,
} from '@/lib/supabase/eventPos';
import { PosProductList } from './PosProductList';
import { PosExportSection } from './PosExportSection';
import { PosSalesImport } from './PosSalesImport';
import { PosSalesChart } from './PosSalesChart';
import { toast } from 'sonner';
import { ImportSalesCsvModal } from './modals/ImportSalesCsvModal';

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
  const [addingProduct, setAddingProduct] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

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

  const handleAddProductInline = useCallback(async () => {
    setAddingProduct(true);
    try {
      const product = await createEventPosProduct(event.id, {
        name: 'Nouveau produit',
        category: 'alcool',
      });
      await createEventPosVariant(product.id, {
        price: 0,
        stock_initial: 0,
        sale_unit_cl: 25,
      });
      toast.success('Produit ajouté');
      await fetchData({ silent: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setAddingProduct(false);
    }
  }, [event.id, fetchData]);

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
              variant="primary"
              size="sm"
              onClick={handleAddProductInline}
              disabled={addingProduct}
            >
              {addingProduct ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Plus size={14} className="mr-1.5" />
              )}
              Ajouter un produit
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => setToolbar(null);
  }, [event.id, event.name, setToolbar, addingProduct, handleAddProductInline]);

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

      <Card variant="outline">
        <CardContent className="p-0">
          {products.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Aucun produit"
              description="Ajoutez vos produits en vente (boissons, merch, billets) pour gérer le stock et les ventes."
              variant="compact"
            />
          ) : (
            <PosProductList
              products={products}
              eventId={event.id}
              sales={sales}
              onRefresh={() => fetchData({ silent: true })}
            />
          )}
        </CardContent>
      </Card>

      {sales.length > 0 && (
        <PosSalesChart sales={sales} products={products} />
      )}

      {products.length > 0 && (
        <PosSalesImport
          eventId={event.id}
          eventDate={typeof event.date === 'string' ? event.date : new Date(event.date).toISOString()}
          hideImportCard
        />
      )}

      <ImportSalesCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        eventId={event.id}
        products={products}
        defaultDate={typeof event.date === 'string' ? event.date : new Date(event.date).toISOString()}
        onSuccess={() => {
          setImportModalOpen(false);
          fetchData({ silent: true });
        }}
      />
    </div>
  );
}
