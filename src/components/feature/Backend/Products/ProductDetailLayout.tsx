"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Product } from '@/types/product';
import { ProductDetailProvider, useProductDetail } from './ProductDetailProvider';
import { Input } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  AlignLeft,
  BarChart,
  Layers,
  ShoppingCart,
  X,
  MessageSquare,
  Send,
  ChevronDown,
  Package,
} from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { productDataService } from '@/lib/services/ProductDataService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

type SectionId = 'info' | 'stock' | 'variantes' | 'commandes';

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
  slug: string;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'info',      label: 'Informations', icon: <AlignLeft size={16} />,    headerIcon: <AlignLeft size={28} />,    slug: '' },
  { id: 'stock',     label: 'Stock',        icon: <BarChart size={16} />,     headerIcon: <BarChart size={28} />,     slug: '/stock' },
  { id: 'variantes', label: 'Variantes',    icon: <Layers size={16} />,       headerIcon: <Layers size={28} />,       slug: '/variantes' },
  { id: 'commandes', label: 'Commandes',    icon: <ShoppingCart size={16} />, headerIcon: <ShoppingCart size={28} />, slug: '/commandes' },
];

function getActiveSectionFromPath(pathname: string, basePath: string): SectionId {
  const relative = pathname.replace(basePath, '');
  if (relative === '/stock') return 'stock';
  if (relative === '/variantes') return 'variantes';
  if (relative === '/commandes') return 'commandes';
  return 'info';
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { product, setProduct } = useProductDetail();
  const { toolbar } = useToolbar();

  const basePath = `/dashboard/products/${product.id}`;
  const activeSection = getActiveSectionFromPath(pathname, basePath);
  const activeConfig = SIDEBAR_SECTIONS.find(s => s.id === activeSection);

  // Product selector
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productDataService.getProducts().then(products => {
      setAllProducts(products.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAuthor, setChatAuthor] = useState('');
  const [chatContent, setChatContent] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);

  const comments = useMemo(() => product.comments || [], [product.comments]);

  const handleSendChat = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!chatAuthor.trim() || !chatContent.trim()) return;
    await productDataService.addComment(product.id, chatAuthor.trim(), chatContent.trim());
    const updated = await productDataService.getProductById(product.id);
    if (updated) setProduct(updated);
    setChatContent('');
    if (chatTextareaRef.current) chatTextareaRef.current.style.height = 'auto';
    setTimeout(() => {
      chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const handleChatTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatContent(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'instant' });
      }, 50);
    }
  }, [chatOpen]);

  const STATUS_LABELS: Record<string, string> = {
    idea: 'Idée',
    in_production: 'En production',
    available: 'Disponible',
    out_of_stock: 'Rupture',
    archived: 'Archivé',
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">

          <button
            onClick={() => router.push('/dashboard/products')}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground transition-colors w-full px-2 py-1.5 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
          >
            <ArrowLeft size={16} />
            <span>Retour aux produits</span>
          </button>

          <div className="border-t border-border-custom pt-4">
            {/* Product selector */}
            <div className="mb-3 relative">
              <button
                onClick={() => setSelectorOpen((o) => !o)}
                className={cn(
                  'w-full flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left transition-colors group',
                  selectorOpen
                    ? 'bg-zinc-100 dark:bg-zinc-800 border border-border-custom'
                    : 'border border-border-custom hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                )}
              >
                <span className="font-bold text-sm truncate">{product.name}</span>
                <ChevronDown size={14} className={cn('shrink-0 text-zinc-400 transition-transform', selectorOpen && 'rotate-180')} />
              </button>
              {selectorOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-full bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
                  {allProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectorOpen(false);
                        router.push(`/dashboard/products/${p.id}`);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col gap-0.5',
                        p.id === product.id && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="text-xs text-zinc-400">{p.sku} · {STATUS_LABELS[p.status] || p.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section links */}
            <div className="space-y-0.5">
              {SIDEBAR_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`${basePath}${section.slug}`}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                      : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {toolbar && (
          <div className="sticky top-0 z-20 shrink-0">
            {toolbar}
          </div>
        )}

        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">

            {activeSection !== 'info' && activeConfig && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {activeConfig.headerIcon}
                  {activeConfig.label}
                </h2>
              </div>
            )}

            {children}

          </div>
        </div>
      </main>

      {/* Chat button */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          chatOpen
            ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 rotate-0"
            : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105"
        )}
        aria-label="Commentaires"
      >
        {chatOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {!chatOpen && comments.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
            {comments.length}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div className={cn(
        "fixed bottom-24 right-6 z-40 w-80 flex flex-col rounded-xl border border-border-custom bg-card-bg shadow-2xl transition-all duration-300 origin-bottom-right",
        chatOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )} style={{ height: '480px', maxHeight: 'calc(100vh - 140px)' }}>

        <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm">Commentaires</span>
            {comments.length > 0 && (
              <span className="text-xs text-zinc-500">({comments.length})</span>
            )}
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>

        <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-3 min-h-0">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={28} className="text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-500">Aucun commentaire pour le moment</p>
              <p className="text-xs text-zinc-400 mt-0.5">Soyez le premier à commenter !</p>
            </div>
          ) : (() => {
            const sorted = [...comments].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return (
              <div className="space-y-0.5">
                {sorted.map((comment, index) => {
                  const prev = sorted[index - 1];
                  const isGrouped = prev?.author === comment.author;
                  return (
                    <div key={comment.id} className={cn("space-y-0.5", !isGrouped && index > 0 && "mt-4")}>
                      {!isGrouped && (
                        <div className="flex items-baseline gap-2 px-1 mb-1">
                          <span className="text-xs font-semibold">{comment.author}</span>
                          <span className="text-[10px] text-zinc-400">
                            {format(new Date(comment.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                          </span>
                        </div>
                      )}
                      <div className={cn(
                        "bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed",
                        !isGrouped ? "rounded-lg rounded-tl-none" : "rounded-lg"
                      )}>
                        {comment.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <form onSubmit={handleSendChat} className="p-3 border-t border-border-custom space-y-2 shrink-0">
          <Input
            type="text"
            placeholder="Votre nom"
            value={chatAuthor}
            onChange={(e) => setChatAuthor(e.target.value)}
            fullWidth
          />
          <div className="flex rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-zinc-950 dark:focus-within:ring-zinc-300">
            <textarea
              ref={chatTextareaRef}
              placeholder="Écrire un commentaire..."
              value={chatContent}
              onChange={handleChatTextareaChange}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSendChat(e);
              }}
              rows={1}
              className="flex-1 min-w-0 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none overflow-y-auto"
              style={{ minHeight: '36px', maxHeight: '120px' }}
            />
            <div className="flex items-end shrink-0 p-1.5">
              <button
                type="submit"
                disabled={!chatAuthor.trim() || !chatContent.trim()}
                className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400">⌘↵ pour envoyer</p>
        </form>
      </div>
    </div>
  );
}

interface ProductDetailLayoutProps {
  productId: string;
  children: React.ReactNode;
}

export function ProductDetailLayout({ productId, children }: ProductDetailLayoutProps) {
  const router = useRouter();
  const [initialProduct, setInitialProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    productDataService.getProductById(productId).then(found => {
      setInitialProduct(found ?? null);
    });
  }, [productId]);

  if (initialProduct === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  if (initialProduct === null) {
    router.replace('/dashboard/products');
    return null;
  }

  return (
    <ProductDetailProvider key={productId} initialProduct={initialProduct}>
      <LayoutInner>{children}</LayoutInner>
    </ProductDetailProvider>
  );
}
