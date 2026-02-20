'use client';

import { useState, useEffect, useRef } from 'react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar } from '@/components/ui/organisms';
import { Package, BarChart, TrendingUp, ShoppingCart, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn } from '@/lib/animations';
import { ProductFilters, OrderFilters } from '@/types';

// Tabs
import CatalogTab from './Catalog/components/CatalogTab';
import StockTab from './Stock/components/StockTab';
import StatsTab from './Stats/components/StatsTab';
import OrdersDashboard from '@/components/feature/Backend/Orders/Dashboard/components/OrdersDashboard';

// Modals
import NewProductModal from './Catalog/modals/NewProductModal';
import AddStockMovementModal from './Stock/modals/AddStockMovementModal';

type TabType = 'catalog' | 'stock' | 'stats' | 'orders';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const { setToolbar } = useToolbar();

  // Modal states
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);

  // Catalog filters
  const [catalogFilters, setCatalogFilters] = useState<ProductFilters>({
    search: '',
    type: 'all',
    status: 'all',
    category: '',
    collection: '',
    event_id: '',
    low_stock: false,
  });

  // Orders filters
  const [ordersFilters, setOrdersFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    source: 'all',
    payment_status: 'all',
  });

  // Dropdown states
  const [isCatalogTypeOpen, setIsCatalogTypeOpen] = useState(false);
  const [isCatalogStatusOpen, setIsCatalogStatusOpen] = useState(false);
  const [isOrdersStatusOpen, setIsOrdersStatusOpen] = useState(false);
  const [isOrdersSourceOpen, setIsOrdersSourceOpen] = useState(false);
  const [isOrdersPaymentOpen, setIsOrdersPaymentOpen] = useState(false);

  // Refs for dropdown positioning
  const catalogTypeRef = useRef<HTMLButtonElement>(null);
  const catalogStatusRef = useRef<HTMLButtonElement>(null);
  const ordersStatusRef = useRef<HTMLButtonElement>(null);
  const ordersSourceRef = useRef<HTMLButtonElement>(null);
  const ordersPaymentRef = useRef<HTMLButtonElement>(null);

  const tabs = [
    { id: 'catalog' as TabType, label: 'Catalogue', icon: Package },
    { id: 'stock' as TabType, label: 'Stock', icon: BarChart },
    { id: 'orders' as TabType, label: 'Commandes', icon: ShoppingCart },
    { id: 'stats' as TabType, label: 'Statistiques', icon: TrendingUp },
  ];

  // Helper to get dropdown position
  const getDropdownPosition = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return {};
    const rect = ref.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
    };
  };

  useEffect(() => {
    setToolbar(
      <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 flex-1 h-full">
          {/* Switcher a gauche */}
          <div className="flex items-center gap-6 px-2 h-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 h-full text-xs font-medium transition-colors uppercase',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  )}
                  title={tab.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Catalogue filters and actions */}
          {activeTab === 'catalog' && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {/* Type filter */}
                <div className="relative">
                  <button
                    ref={catalogTypeRef}
                    onClick={() => setIsCatalogTypeOpen(!isCatalogTypeOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500"
                    )}
                  >
                    {catalogFilters.type === 'all' ? 'Tous' : 
                     catalogFilters.type === 'tshirt' ? 'T-shirts' :
                     catalogFilters.type === 'poster' ? 'Affiches' :
                     catalogFilters.type === 'keychain' ? 'Porte-clés' :
                     catalogFilters.type === 'fan' ? 'Éventails' : 'Autre'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isCatalogTypeOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isCatalogTypeOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsCatalogTypeOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg"
                          style={getDropdownPosition(catalogTypeRef)}
                        >
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'Tous' },
                              { value: 'tshirt', label: 'T-shirts' },
                              { value: 'poster', label: 'Affiches' },
                              { value: 'keychain', label: 'Porte-clés' },
                              { value: 'fan', label: 'Éventails' },
                              { value: 'other', label: 'Autre' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setCatalogFilters({ ...catalogFilters, type: option.value as any });
                                  setIsCatalogTypeOpen(false);
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  catalogFilters.type === option.value
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status filter */}
                <div className="relative">
                  <button
                    ref={catalogStatusRef}
                    onClick={() => setIsCatalogStatusOpen(!isCatalogStatusOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500"
                    )}
                  >
                    {catalogFilters.status === 'all' ? 'Tous' :
                     catalogFilters.status === 'idea' ? 'Idée' :
                     catalogFilters.status === 'in_production' ? 'En production' :
                     catalogFilters.status === 'available' ? 'Disponible' :
                     catalogFilters.status === 'out_of_stock' ? 'Rupture' : 'Archivé'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isCatalogStatusOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isCatalogStatusOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsCatalogStatusOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg"
                          style={getDropdownPosition(catalogStatusRef)}
                        >
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'Tous' },
                              { value: 'idea', label: 'Idée' },
                              { value: 'in_production', label: 'En production' },
                              { value: 'available', label: 'Disponible' },
                              { value: 'out_of_stock', label: 'Rupture' },
                              { value: 'archived', label: 'Archivé' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setCatalogFilters({ ...catalogFilters, status: option.value as any });
                                  setIsCatalogStatusOpen(false);
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  catalogFilters.status === option.value
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Low stock checkbox */}
                <label className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded border border-zinc-700 hover:border-zinc-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={catalogFilters.low_stock}
                    onChange={(e) => setCatalogFilters({ ...catalogFilters, low_stock: e.target.checked })}
                    className="w-3 h-3 text-accent border-zinc-700 rounded focus:ring-accent"
                  />
                  <span className="text-xs font-medium text-zinc-400">Stock faible</span>
                </label>

                {/* New product button */}
                <button
                  onClick={() => setShowNewProductModal(true)}
                  className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Nouveau Produit
                </button>
              </div>
            </>
          )}

          {/* Stock actions */}
          {activeTab === 'stock' && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStockMovementModal(true)}
                  className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter un mouvement
                </button>
              </div>
            </>
          )}

          {/* Orders filters and actions */}
          {activeTab === 'orders' && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {/* Status filter */}
                <div className="relative">
                  <button
                    ref={ordersStatusRef}
                    onClick={() => setIsOrdersStatusOpen(!isOrdersStatusOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500"
                    )}
                  >
                    {ordersFilters.status === 'all' ? 'Tous' :
                     ordersFilters.status === 'cart' ? 'Panier' :
                     ordersFilters.status === 'pending_payment' ? 'En attente' :
                     ordersFilters.status === 'paid' ? 'Payée' :
                     ordersFilters.status === 'preparing' ? 'Préparation' :
                     ordersFilters.status === 'shipped' ? 'Expédiée' :
                     ordersFilters.status === 'delivered' ? 'Livrée' :
                     ordersFilters.status === 'returned' ? 'Retournée' : 'Annulée'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isOrdersStatusOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isOrdersStatusOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOrdersStatusOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg"
                          style={getDropdownPosition(ordersStatusRef)}
                        >
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'Tous' },
                              { value: 'cart', label: 'Panier' },
                              { value: 'pending_payment', label: 'En attente' },
                              { value: 'paid', label: 'Payée' },
                              { value: 'preparing', label: 'Préparation' },
                              { value: 'shipped', label: 'Expédiée' },
                              { value: 'delivered', label: 'Livrée' },
                              { value: 'returned', label: 'Retournée' },
                              { value: 'cancelled', label: 'Annulée' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOrdersFilters({ ...ordersFilters, status: option.value as any });
                                  setIsOrdersStatusOpen(false);
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  ordersFilters.status === option.value
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Source filter */}
                <div className="relative">
                  <button
                    ref={ordersSourceRef}
                    onClick={() => setIsOrdersSourceOpen(!isOrdersSourceOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500"
                    )}
                  >
                    {ordersFilters.source === 'all' ? 'Toutes' :
                     ordersFilters.source === 'manual' ? 'Manuelle' :
                     ordersFilters.source === 'online_shop' ? 'En ligne' : 'Événement'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isOrdersSourceOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isOrdersSourceOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOrdersSourceOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg"
                          style={getDropdownPosition(ordersSourceRef)}
                        >
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'Toutes' },
                              { value: 'manual', label: 'Manuelle' },
                              { value: 'online_shop', label: 'En ligne' },
                              { value: 'event', label: 'Événement' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOrdersFilters({ ...ordersFilters, source: option.value as any });
                                  setIsOrdersSourceOpen(false);
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  ordersFilters.source === option.value
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Payment status filter */}
                <div className="relative">
                  <button
                    ref={ordersPaymentRef}
                    onClick={() => setIsOrdersPaymentOpen(!isOrdersPaymentOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500"
                    )}
                  >
                    {ordersFilters.payment_status === 'all' ? 'Tous' :
                     ordersFilters.payment_status === 'pending' ? 'En attente' :
                     ordersFilters.payment_status === 'paid' ? 'Payé' :
                     ordersFilters.payment_status === 'failed' ? 'Échoué' : 'Remboursé'}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isOrdersPaymentOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {isOrdersPaymentOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsOrdersPaymentOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg"
                          style={getDropdownPosition(ordersPaymentRef)}
                        >
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'Tous' },
                              { value: 'pending', label: 'En attente' },
                              { value: 'paid', label: 'Payé' },
                              { value: 'failed', label: 'Échoué' },
                              { value: 'refunded', label: 'Remboursé' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOrdersFilters({ ...ordersFilters, payment_status: option.value as any });
                                  setIsOrdersPaymentOpen(false);
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  ordersFilters.payment_status === option.value
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* New order button */}
                <button
                  className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Nouvelle Commande
                </button>
              </div>
            </>
          )}
        </div>
      </PageToolbar>
    );

    return () => {
      setToolbar(null);
    };
  }, [activeTab, catalogFilters, ordersFilters, isCatalogTypeOpen, isCatalogStatusOpen, isOrdersStatusOpen, isOrdersSourceOpen, isOrdersPaymentOpen]);

  return (
    <>
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="min-h-[500px]">
          {activeTab === 'catalog' && <CatalogTab filters={catalogFilters} />}
          {activeTab === 'stock' && <StockTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'orders' && <OrdersDashboard filters={ordersFilters} />}
        </div>
      </motion.div>

      {/* Modals */}
      {showNewProductModal && (
        <NewProductModal
          isOpen={showNewProductModal}
          onClose={() => setShowNewProductModal(false)}
        />
      )}

      {showStockMovementModal && (
        <AddStockMovementModal
          isOpen={showStockMovementModal}
          onClose={() => setShowStockMovementModal(false)}
        />
      )}
    </>
  );
}
