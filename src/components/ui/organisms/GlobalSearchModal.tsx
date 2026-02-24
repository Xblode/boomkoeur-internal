'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Calendar,
  FileText,
  Receipt,
  Package,
  Users,
  User,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Input, IconButton } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';
import { getEvents } from '@/lib/supabase/events';
import { getCampaigns } from '@/lib/localStorage/communication';
import { getTransactions } from '@/lib/supabase/finance';
import { getInvoices } from '@/lib/supabase/finance';
import { getProducts } from '@/lib/supabase/products';
import { getCommercialContacts } from '@/lib/supabase/commercial';
import { getOrgUsers } from '@/lib/supabase/users';
import type { Event } from '@/types/event';
import type { Campaign } from '@/types/communication';
import type { Transaction } from '@/types/finance';
import type { Invoice } from '@/types/finance';
import type { Product } from '@/types/product';
import type { CommercialContact } from '@/types/commercial';
import type { User as UserType } from '@/types/user';

const MAX_RESULTS_PER_TYPE = 5;
const DEBOUNCE_MS = 300;

export interface SearchResultItem {
  id: string;
  type: 'event' | 'post' | 'transaction' | 'invoice' | 'product' | 'contact' | 'member';
  title: string;
  subtitle?: string;
  href: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { activeOrg } = useOrg();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<(Invoice & { invoice_lines: unknown[] })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [members, setMembers] = useState<UserType[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    setQuery('');
    setDebouncedQuery('');
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const loadAllData = useCallback(async () => {
    if (dataLoaded) return;
    setLoading(true);
    try {
      const [evts, camp, tx, inv, prods, cont] = await Promise.all([
        getEvents(),
        typeof window !== 'undefined' ? getCampaigns() : Promise.resolve([]),
        getTransactions(),
        getInvoices(),
        getProducts(),
        getCommercialContacts(),
      ]);
      setEvents(evts);
      setCampaigns(camp);
      setTransactions(tx);
      setInvoices(inv);
      setProducts(prods);
      setContacts(cont);
      if (activeOrg?.id) {
        const mems = await getOrgUsers(activeOrg.id);
        setMembers(mems);
      }
      setDataLoaded(true);
    } catch (err) {
      console.error('Erreur chargement recherche:', err);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded, activeOrg?.id]);

  useEffect(() => {
    if (isOpen) loadAllData();
  }, [isOpen, loadAllData]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const q = debouncedQuery.toLowerCase().trim();
    const items: SearchResultItem[] = [];

    events
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q)) ||
          e.location?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((e) => {
        items.push({
          id: e.id,
          type: 'event',
          title: e.name,
          subtitle: e.date ? new Date(e.date).toLocaleDateString('fr-FR') : undefined,
          href: `/dashboard/events/${e.id}`,
        });
      });

    const postItems: SearchResultItem[] = [];
    campaigns.forEach((camp) => {
      const matchingPosts = camp.posts.filter(
        (p) =>
          p.type?.toLowerCase().includes(q) ||
          p.caption?.toLowerCase().includes(q) ||
          camp.name.toLowerCase().includes(q)
      );
      matchingPosts.forEach((p) => {
        postItems.push({
          id: `${camp.id}-${p.id}`,
          type: 'post',
          title: p.caption?.slice(0, 50) || p.type || 'Post',
          subtitle: camp.name,
          href: `/dashboard/communication/${camp.id}`,
        });
      });
      if (matchingPosts.length === 0 && camp.name.toLowerCase().includes(q)) {
        postItems.push({
          id: `camp-${camp.id}`,
          type: 'post',
          title: camp.name,
          subtitle: 'Campagne',
          href: `/dashboard/communication/${camp.id}`,
        });
      }
    });
    items.push(...postItems.slice(0, MAX_RESULTS_PER_TYPE));

    transactions
      .filter(
        (t) =>
          t.label?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.entry_number?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((t) => {
        items.push({
          id: t.id,
          type: 'transaction',
          title: t.label || 'Transaction',
          subtitle: `${t.amount.toLocaleString('fr-FR')} € · ${t.category}`,
          href: `/dashboard/finance?section=transactions`,
        });
      });

    invoices
      .filter(
        (i) =>
          i.invoice_number?.toLowerCase().includes(q) ||
          i.client_name?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((i) => {
        items.push({
          id: i.id,
          type: 'invoice',
          title: i.client_name || i.invoice_number || 'Facture',
          subtitle: `${i.invoice_number} · ${i.total_incl_tax?.toLocaleString('fr-FR') ?? ''} €`,
          href: `/dashboard/finance?section=factures`,
        });
      });

    products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((p) => {
        items.push({
          id: p.id,
          type: 'product',
          title: p.name,
          subtitle: p.sku,
          href: `/dashboard/products/${p.id}`,
        });
      });

    contacts
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((c) => {
        items.push({
          id: c.id,
          type: 'contact',
          title: c.name || c.company || 'Contact',
          subtitle: c.company || c.email,
          href: `/dashboard/commercial?contactId=${c.id}`,
        });
      });

    members
      .filter(
        (m) =>
          m.firstName?.toLowerCase().includes(q) ||
          m.lastName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .forEach((m) => {
        items.push({
          id: m.id,
          type: 'member',
          title: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email,
          subtitle: m.email,
          href: `/dashboard/admin/utilisateurs?userId=${m.id}`,
        });
      });

    setResults(items);
  }, [
    debouncedQuery,
    events,
    campaigns,
    transactions,
    invoices,
    products,
    contacts,
    members,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const typeLabels: Record<SearchResultItem['type'], string> = {
    event: 'Événement',
    post: 'Post',
    transaction: 'Transaction',
    invoice: 'Facture',
    product: 'Produit',
    contact: 'Contact',
    member: 'Membre',
  };

  const typeIcons: Record<SearchResultItem['type'], React.ReactNode> = {
    event: <Calendar size={16} />,
    post: <MessageSquare size={16} />,
    transaction: <Receipt size={16} />,
    invoice: <FileText size={16} />,
    product: <Package size={16} />,
    contact: <Users size={16} />,
    member: <User size={16} />,
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[var(--z-overlay)] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-[20%] z-[var(--z-overlay)] max-w-2xl mx-auto overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-backend animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-zinc-500" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher événements, transactions, produits..."
            className="flex-1 min-w-0 border-0 shadow-none focus-visible:ring-0 h-11 py-3 bg-transparent"
          />
          <IconButton
            icon={X}
            ariaLabel="Fermer la recherche"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 h-auto w-auto"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {loading && !dataLoaded ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          ) : !query.trim() ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Tapez pour rechercher...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Aucun résultat trouvé.
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                    {typeIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-zinc-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wide flex-shrink-0">
                    {typeLabels[item.type]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
