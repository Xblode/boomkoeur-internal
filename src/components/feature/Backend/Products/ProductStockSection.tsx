"use client";

import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, CardContent } from '@/components/ui';
import { useProductDetail } from './ProductDetailProvider';
import { productDataService } from '@/lib/services/ProductDataService';
import { StockMovementInput, Provider } from '@/types/product';
import { Button, Input, Select, Label, Textarea } from '@/components/ui/atoms';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import {
  AlertCircle,
  BarChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Truck,
  Mail,
  Phone,
  MapPin,
  User,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadedProvider = { provider: Provider; role: string };

export function ProductStockSection() {
  const { product, variants, stockMovements, reloadStockMovements, reloadProduct, reloadVariants } = useProductDetail();
  const { setToolbar } = useToolbar();
  const [loadedProviders, setLoadedProviders] = useState<LoadedProvider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const productProviders = product.providers || [];
    if (productProviders.length === 0) {
      setLoadedProviders([]);
      return;
    }
    Promise.all(
      productProviders.map(async ({ provider_id, role }) => {
        const provider = await productDataService.getProviderById(provider_id);
        return provider ? { provider, role } : null;
      })
    ).then(results => {
      setLoadedProviders(results.filter((r): r is LoadedProvider => r !== null));
    });
  }, [product.providers]);

  // Movement form
  const [movementVariant, setMovementVariant] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReason, setMovementReason] = useState<string>('purchase');
  const [movementNotes, setMovementNotes] = useState('');

  const isLowStock = product.total_stock < product.stock_threshold;

  useEffect(() => {
    setToolbar(
      <PageToolbar
        filters={<PageToolbarFilters />}
        actions={
          <PageToolbarActions>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-3 h-3 mr-1.5" />
              Ajouter un mouvement
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => { setToolbar(null); };
  }, [setToolbar]);

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementVariant || !movementQuantity) return;
    setIsSubmitting(true);
    try {
      const input: StockMovementInput = {
        product_id: product.id,
        variant_id: movementVariant,
        type: movementType,
        quantity: parseInt(movementQuantity),
        reason: movementReason as StockMovementInput['reason'],
        notes: movementNotes || undefined,
        date: new Date().toISOString(),
      };
      await productDataService.addStockMovement(input);
      await Promise.all([reloadStockMovements(), reloadProduct(), reloadVariants()]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding stock movement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMovementVariant('');
    setMovementType('in');
    setMovementQuantity('');
    setMovementReason('purchase');
    setMovementNotes('');
  };

  const REASON_LABELS: Record<string, string> = {
    purchase: 'Achat',
    sale: 'Vente',
    return: 'Retour',
    loss: 'Perte/Vol',
    adjustment: 'Ajustement',
  };

  const IN_REASONS = ['purchase', 'return', 'adjustment'];
  const OUT_REASONS = ['sale', 'loss', 'adjustment'];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<BarChart size={28} />}
        title="Stock"
      />
      {/* Fournisseurs card */}
      {(product.providers || []).length > 0 ? (
        <Card variant="outline" className="bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-custom">
            <Truck size={15} className="text-zinc-500" />
            <h3 className="text-sm font-semibold">Fournisseurs</h3>
            <span className="ml-1 text-xs text-zinc-400">{loadedProviders.length} lié{loadedProviders.length > 1 ? 's' : ''}</span>
          </div>
          {loadedProviders.length === 0 ? (
            <div className="p-4 text-sm text-zinc-400">Chargement...</div>
          ) : (
            <div className="divide-y divide-border-custom">
              {loadedProviders.map(({ provider, role }) => (
                <div key={provider.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold">{provider.name}</span>
                    <span className="text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-full">{role}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                    {provider.contact_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-zinc-500 shrink-0">Contact</span>
                        <span className="font-medium truncate">{provider.contact_name}</span>
                      </div>
                    )}
                    {provider.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-zinc-500 shrink-0">Email</span>
                        <a href={`mailto:${provider.email}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate">
                          {provider.email}
                        </a>
                      </div>
                    )}
                    {provider.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-zinc-500 shrink-0">Téléphone</span>
                        <a href={`tel:${provider.phone}`} className="font-medium hover:underline truncate">{provider.phone}</a>
                      </div>
                    )}
                    {provider.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={12} className="text-zinc-400 shrink-0" />
                        <span className="text-zinc-500 shrink-0">Adresse</span>
                        <span className="font-medium truncate">{provider.address}</span>
                      </div>
                    )}
                    {provider.notes && (
                      <div className="flex items-start gap-2 text-sm sm:col-span-2">
                        <StickyNote size={12} className="text-zinc-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-500 shrink-0">Notes</span>
                        <span className="text-zinc-600 dark:text-zinc-400">{provider.notes}</span>
                      </div>
                    )}
                    {!provider.contact_name && !provider.email && !provider.phone && !provider.address && (
                      <p className="text-xs text-zinc-400 sm:col-span-2">Aucune information de contact.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed border-border-custom p-4 flex items-center gap-2 text-sm text-zinc-400">
          <Truck size={15} />
          Aucun fournisseur assigné à ce produit. Ajoutez-en depuis la page Information.
        </div>
      )}

      {/* Stock summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="outline" className="bg-zinc-50/50 dark:bg-zinc-900/30">
          <CardContent className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Stock total</p>
          <p className={cn('text-2xl font-bold', isLowStock ? 'text-orange-600 dark:text-orange-400' : 'text-foreground')}>
            {product.total_stock}
          </p>
          </CardContent>
        </Card>
        <Card variant="outline" className="bg-zinc-50/50 dark:bg-zinc-900/30">
          <CardContent className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Variantes</p>
          <p className="text-2xl font-bold text-foreground">{variants.length}</p>
          </CardContent>
        </Card>
        <Card variant="outline" className="bg-zinc-50/50 dark:bg-zinc-900/30">
          <CardContent className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Seuil d&apos;alerte</p>
          <p className="text-2xl font-bold text-foreground">{product.stock_threshold}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alert */}
      {isLowStock && (
        <div className="bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
            <AlertCircle size={20} />
            <h3 className="font-semibold">Stock en dessous du seuil d&apos;alerte !</h3>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
            Le stock actuel ({product.total_stock}) est inférieur au seuil ({product.stock_threshold}).
          </p>
        </div>
      )}

      {/* Stock per variant */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Stock par variante</h3>
          <Card variant="outline" className="overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-card-bg">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Variante</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Prix achat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {variants.map(v => (
                  <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium">
                      {v.size && v.color ? `${v.size} · ${v.color}` : v.size || v.color || 'Standard'}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-mono text-zinc-500">{v.sku}</td>
                    <td className="px-4 py-2.5 text-sm">
                      <span className={cn('font-semibold', v.stock < 5 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground')}>
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {v.purchase_price.toFixed(2)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Recent movements */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Derniers mouvements</h3>
        {stockMovements.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-border-custom rounded-lg">
            Aucun mouvement de stock pour ce produit
          </div>
        ) : (
          <Card variant="outline" className="overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-card-bg">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantité</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Raison</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {stockMovements.slice(0, 20).map(m => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2.5 text-sm">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {m.type === 'in' ? (
                          <>
                            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Entrée</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">Sortie</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold">{m.quantity}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">{REASON_LABELS[m.reason] || m.reason}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-500 max-w-xs truncate">{m.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Add movement modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Nouveau mouvement de stock" size="md">
          <form onSubmit={handleSubmitMovement} className="space-y-4">
            <div>
              <Label>Variante *</Label>
              <Select
                value={movementVariant}
                onChange={(e) => setMovementVariant(e.target.value)}
                options={[
                  { value: '', label: 'Sélectionner...' },
                  ...variants.map(v => ({
                    value: v.id,
                    label: v.size && v.color ? `${v.size} · ${v.color}` : v.size || v.color || 'Standard',
                  })),
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={movementType}
                  onChange={(e) => {
                    const t = e.target.value as 'in' | 'out';
                    setMovementType(t);
                    setMovementReason(t === 'in' ? 'purchase' : 'sale');
                  }}
                  options={[
                    { value: 'in', label: 'Entrée' },
                    { value: 'out', label: 'Sortie' },
                  ]}
                />
              </div>
              <div>
                <Label>Quantité *</Label>
                <Input
                  type="number"
                  min="1"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Raison</Label>
              <Select
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                options={(movementType === 'in' ? IN_REASONS : OUT_REASONS).map(r => ({
                  value: r,
                  label: REASON_LABELS[r],
                }))}
              />
            </div>
            <div>
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                rows={2}
                placeholder="Notes sur ce mouvement..."
              />
            </div>
          </form>
          <ModalFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" disabled={isSubmitting || !movementVariant || !movementQuantity} onClick={handleSubmitMovement}>
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
