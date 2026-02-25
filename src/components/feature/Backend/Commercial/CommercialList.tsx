'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  createCommercialContact,
  updateCommercialContact,
  deleteCommercialContact,
} from '@/lib/supabase/commercial';
import { CommercialContact, ContactType, ContactStatus } from '@/types/commercial';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  Globe,
  User,
  Users,
  Plus,
  MoreVertical,
  ChevronDown,
  Star,
  Tag,
  Activity,
} from 'lucide-react';
import { Badge, Button, Input, Select, Skeleton, Textarea } from '@/components/ui/atoms';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/atoms';
import { SectionHeader, SearchInput, FilterField, EmptyState, TabSwitcher, EditableCard, Card } from '@/components/ui/molecules';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/organisms';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS = [
  { value: 'supplier' as ContactType, label: 'Fournisseur' },
  { value: 'contact' as ContactType, label: 'Contact' },
  { value: 'partner' as ContactType, label: 'Partenaire' },
];

const STATUS_OPTIONS = [
  { value: 'lead' as ContactStatus, label: 'Lead' },
  { value: 'active' as ContactStatus, label: 'Actif' },
  { value: 'inactive' as ContactStatus, label: 'Inactif' },
];

type SortColumn = 'name' | 'type' | 'status' | 'email' | 'phone';

type EditableDetailProps = {
  icon: React.ReactNode;
  contact: CommercialContact;
  field: string;
  editingCell: { id: string; field: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onStartEdit: (id: string, field: string, value: string) => void;
  onSave: (id: string, field: string) => void;
  onCancelEdit: () => void;
  renderDisplay: (v: string) => React.ReactNode;
  placeholder?: string;
  textarea?: boolean;
  className?: string;
};

function EditableDetail({
  icon,
  contact,
  field,
  editingCell,
  editValue,
  setEditValue,
  inputRef,
  onStartEdit,
  onSave,
  onCancelEdit,
  renderDisplay,
  placeholder,
  textarea,
  className,
}: EditableDetailProps) {
  const value = (contact as Record<string, unknown>)[field] as string | undefined;
  const isEditing = editingCell?.id === contact.id && editingCell?.field === field;
  const display = renderDisplay(value || '');

  if (!display && !isEditing) {
    return (
      <div
        className={cn('flex items-start gap-2 cursor-text group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]', className)}
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(contact.id, field, value || '');
        }}
      >
        {icon}
        <span className="text-zinc-400 italic text-sm">{placeholder || field}</span>
        <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
      </div>
    );
  }

  if (isEditing) {
    const inputProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onBlur: () => onSave(contact.id, field),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !textarea) onSave(contact.id, field);
        if (e.key === 'Escape') onCancelEdit();
      },
      className: 'flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm',
      placeholder,
    };
    return (
      <div className={cn('flex items-start gap-2', className)} onClick={(e) => e.stopPropagation()}>
        {icon}
        {textarea ? (
          <Textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} {...inputProps} rows={3} className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0" />
        ) : (
          <Input ref={inputRef as React.RefObject<HTMLInputElement>} {...inputProps} className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2 cursor-text group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]', className)}
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit(contact.id, field, value || '');
      }}
    >
      {icon}
      {display}
      <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0" />
    </div>
  );
}

type EditableAddressProps = {
  contact: CommercialContact;
  editingCell: { id: string; field: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onStartEdit: (id: string, field: string, value: string) => void;
  onSaveAddress: (id: string, addr: { street?: string; city?: string; postal_code?: string; country?: string }) => void;
  onCancelEdit: () => void;
  formatAddress: (addr?: { street?: string; city?: string; postal_code?: string; country?: string }) => string | null;
};

function EditableAddress({
  contact,
  editingCell,
  editValue,
  setEditValue,
  inputRef,
  onStartEdit,
  onSaveAddress,
  onCancelEdit,
  formatAddress,
}: EditableAddressProps) {
  const addr = contact.address;
  const formatted = formatAddress(addr);
  const isEditing = editingCell?.id === contact.id && editingCell?.field === 'address';

  const parseAddress = (s: string) => {
    const parts = s.split(',').map((p) => p.trim());
    const street = parts[0] || '';
    const cityPart = parts[1] || '';
    const country = parts[2] || '';
    const [postal_code, ...cityWords] = cityPart.split(/\s+/);
    const city = cityWords.join(' ') || '';
    return { street: street || undefined, postal_code: postal_code || undefined, city: city || undefined, country: country || undefined };
  };

  const handleSave = () => {
    const parsed = parseAddress(editValue.trim());
    onSaveAddress(contact.id, parsed);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2 md:col-span-2" onClick={(e) => e.stopPropagation()}>
        <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement | null>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0"
          placeholder="Rue, code postal ville, pays"
        />
      </div>
    );
  }

  if (formatted) {
    return (
      <div
        className="flex items-start gap-2 md:col-span-2 cursor-pointer group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]"
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(contact.id, 'address', formatted);
        }}
      >
        <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
        <span>{formatted}</span>
        <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 md:col-span-2 cursor-pointer group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]"
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit(contact.id, 'address', '');
      }}
    >
      <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
      <span className="text-zinc-400 italic text-sm">Adresse</span>
      <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
    </div>
  );
}

const TYPE_BADGE_VARIANT: Record<ContactType, 'info' | 'secondary' | 'success'> = {
  supplier: 'info',
  contact: 'secondary',
  partner: 'success',
};

const STATUS_BADGE_VARIANT: Record<ContactStatus, 'warning' | 'success' | 'secondary'> = {
  lead: 'warning',
  active: 'success',
  inactive: 'secondary',
};

const PENDING_ID = '__pending__';

function createPendingContact(): CommercialContact {
  return {
    id: PENDING_ID,
    name: '',
    type: 'contact',
    status: 'lead',
    tags: [],
    linked_product_ids: [],
    linked_order_ids: [],
    linked_invoice_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

interface CommercialListProps {
  contacts: CommercialContact[];
  isLoading: boolean;
  /** silent=true : refetch sans afficher le loading */
  onRefetch: (silent?: boolean) => void | Promise<void>;
  /** Mise à jour optimiste locale (affichage immédiat sans refetch) */
  onContactUpdate?: (contact: CommercialContact) => void;
}

export default function CommercialList({ contacts, isLoading, onRefetch, onContactUpdate }: CommercialListProps) {
  const [filteredContacts, setFilteredContacts] = useState<CommercialContact[]>([]);
  const [pendingNewContact, setPendingNewContact] = useState<CommercialContact | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const editValueRef = useRef('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    editValueRef.current = editValue;
  }, [editValue]);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<'type' | 'status' | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [contactToDelete, setContactToDelete] = useState<CommercialContact | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) setViewMode('cards');
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');

  useEffect(() => {
    let filtered = [...contacts];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.company?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.contact_person?.toLowerCase().includes(s) ||
          c.phone?.toLowerCase().includes(s) ||
          c.mobile?.toLowerCase().includes(s)
      );
    }
    if (typeFilter !== 'all') filtered = filtered.filter((c) => c.type === typeFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.status === statusFilter);
    filtered.sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0)); // Favoris en premier
    setFilteredContacts(filtered);
  }, [contacts, searchTerm, typeFilter, statusFilter]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const sortedContacts = useMemo(() => {
    if (!sortBy) return filteredContacts;
    const dir = sortDirection === 'asc' ? 1 : -1;
    const getValue = (c: CommercialContact) => {
      switch (sortBy) {
        case 'name': return (c.name || '').toLowerCase();
        case 'type': return TYPE_OPTIONS.find((o) => o.value === c.type)?.label ?? '';
        case 'status': return STATUS_OPTIONS.find((o) => o.value === c.status)?.label ?? '';
        case 'email': return (c.email || '').toLowerCase();
        case 'phone': return (c.phone || c.mobile || '').toLowerCase();
        default: return '';
      }
    };
    return [...filteredContacts].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      return dir * va.localeCompare(vb);
    });
  }, [filteredContacts, sortBy, sortDirection]);

  const handleAddContact = () => {
    setPendingNewContact(createPendingContact());
    setEditingCell({ id: PENDING_ID, field: 'name' });
    setEditingCardId(PENDING_ID);
    setExpandedId(PENDING_ID);
    setEditValue('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSavePendingName = async () => {
    const name = editValueRef.current.trim();
    if (!name) {
      setPendingNewContact(null);
      setEditingCell(null);
      setEditingCardId(null);
      return;
    }
    try {
      const newContact = await createCommercialContact({
        name,
        type: 'contact',
        status: 'lead',
        tags: [],
        linked_product_ids: [],
        linked_order_ids: [],
        linked_invoice_ids: [],
      });
      await onRefetch(true);
      setPendingNewContact(null);
      setEditingCell(null);
      setEditingCardId(null);
      setExpandedId(newContact.id); // Ouvre le détail du nouveau contact
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleCancelPending = () => {
    setPendingNewContact(null);
    setEditingCell(null);
    setEditingCardId(null);
    if (expandedId === PENDING_ID) setExpandedId(null);
  };

  const handleUpdateField = async (
    id: string,
    field: string,
    value: string | ContactType | ContactStatus | { street?: string; city?: string; postal_code?: string; country?: string }
  ) => {
    try {
      const updated = await updateCommercialContact(id, { [field]: value });
      if (updated) {
        onContactUpdate?.(updated);
        await onRefetch(true);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
    setEditingCell(null);
  };

  const handleToggleFavorite = async (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const nextFavorite = !contact.is_favorite;
    try {
      const updated = await updateCommercialContact(id, { is_favorite: nextFavorite });
      if (updated) {
        onContactUpdate?.(updated);
        await onRefetch(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRequestDelete = (contact: CommercialContact, e: React.MouseEvent) => {
    e.stopPropagation();
    setContactToDelete(contact);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    const id = contactToDelete.id;
    try {
      await deleteCommercialContact(id);
      await onRefetch(true);
      setContactToDelete(null);
      if (expandedId === id) setExpandedId(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEdit = (id: string, field: string) => {
    if (editingCell?.id === id && editingCell?.field === field) {
      if (id === PENDING_ID && field === 'name') {
        handleSavePendingName();
      } else {
        handleUpdateField(id, field, editValueRef.current.trim());
      }
    }
    setEditingCell(null);
  };

  const getTypeLabel = (type: ContactType) => TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  const getStatusLabel = (status: ContactStatus) => STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  const formatAddress = (addr?: { street?: string; city?: string; postal_code?: string; country?: string }) => {
    if (!addr) return null;
    const parts = [addr.street, addr.postal_code, addr.city, addr.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  };

  const expandContent = (contact: CommercialContact, layout: 'grid' | 'stack' = 'grid') => (
    <div
      className={cn(
        'text-sm gap-4',
        layout === 'stack' ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}
    >
      <EditableDetail
        icon={<User size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="name"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <span className="font-semibold">{v}</span> : null}
        placeholder="Nom"
        className="md:col-span-2 lg:col-span-3"
      />
      <EditableDetail
        icon={<Mail size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="email"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`mailto:${v}`} className="text-blue-600 dark:text-blue-400 hover:underline">{v}</a> : null}
        placeholder="Email"
      />
      <EditableDetail
        icon={<Phone size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="phone"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`tel:${v}`} className="hover:underline">{v}</a> : null}
        placeholder="Téléphone"
      />
      <EditableDetail
        icon={<Phone size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="mobile"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`tel:${v}`} className="hover:underline">{v}</a> : null}
        placeholder="Mobile"
      />
      <EditableDetail
        icon={<Globe size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="website"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">{v}</a> : null}
        placeholder="Site web"
      />
      <EditableDetail
        icon={<User size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="contact_person"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <span>{v}</span> : null}
        placeholder="Personne de contact"
      />
      <EditableDetail
        icon={<User size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="position"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <span>{v}</span> : null}
        placeholder="Poste"
      />
      <EditableDetail
        icon={<Building2 size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="company"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => (v && v !== contact.name) ? <span>{v}</span> : null}
        placeholder="Société"
      />
      <EditableAddress
        contact={contact}
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSaveAddress={(id, addr) => handleUpdateField(id, 'address', addr)}
        onCancelEdit={() => setEditingCell(null)}
        formatAddress={formatAddress}
      />
      <EditableDetail
        icon={null}
        contact={contact}
        field="notes"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{v}</p> : null}
        placeholder="Notes"
        textarea
        className="md:col-span-2 lg:col-span-3"
      />
      {(!contact.name && !contact.email && !contact.phone && !contact.mobile && !contact.website && !contact.contact_person && !contact.position && !formatAddress(contact.address) && !contact.notes) && (
        <p className="text-zinc-400 italic md:col-span-2">Cliquez sur un champ pour l&apos;éditer</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-full space-y-4">
        <SectionHeader
          icon={<Users size={28} />}
          title="Commercial"
          subtitle="Gérez vos contacts, partenaires et fournisseurs"
          actions={
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Plus size={14} className="mr-1.5" />
              Nouveau contact
            </Button>
          }
        />
        <div className="flex items-center">
          <TabSwitcher<'table' | 'cards'>
            options={[
              { value: 'table', label: 'Tableau' },
              { value: 'cards', label: 'Cartes' },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </div>
        <EmptyState
          icon={Users}
          title="Aucun contact"
          description="Créez votre premier contact pour commencer."
          action={
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Plus size={14} className="mr-1.5" />
              Nouveau contact
            </Button>
          }
          variant="full"
        />
      </div>
    );
  }

  const allSelected = sortedContacts.length > 0 && selectedIds.size === sortedContacts.length;

  return (
    <div className="w-full space-y-4">
      <SectionHeader
        icon={<Users size={28} />}
        title="Commercial"
        subtitle="Gérez vos contacts, partenaires et fournisseurs"
        actions={
          <Button variant="primary" size="sm" onClick={handleAddContact}>
            <Plus size={14} className="mr-1.5" />
            Nouveau contact
          </Button>
        }
        filters={
          <div className="flex items-end gap-2 md:grid md:grid-cols-3 md:gap-4">
            {/* Recherche: ~50% sur mobile, 1 col sur desktop */}
            <div className="min-w-0 flex-[2] md:col-span-1">
              <SearchInput
                label="Recherche"
                placeholder="Nom, société, email..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            {/* Type: Select sur desktop, icône + Popover sur mobile */}
            <div className="hidden md:block">
              <FilterField label="Type">
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ContactType | 'all')}
                  options={[
                    { value: 'all', label: 'Tous les types' },
                    ...TYPE_OPTIONS,
                  ]}
                />
              </FilterField>
            </div>
            <div className="shrink-0 md:hidden">
              <Popover
                open={filterPopoverOpen === 'type'}
                onOpenChange={(o) => setFilterPopoverOpen(o ? 'type' : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    aria-label="Filtrer par type"
                  >
                    <Tag size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Type</div>
                  {[
                    { value: 'all' as const, label: 'Tous les types' },
                    ...TYPE_OPTIONS,
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTypeFilter(opt.value);
                        setFilterPopoverOpen(null);
                      }}
                      className={cn(
                        'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                        typeFilter === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            {/* Statut: Select sur desktop, icône + Popover sur mobile */}
            <div className="hidden md:block">
              <FilterField label="Statut">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'all')}
                  options={[
                    { value: 'all', label: 'Tous les statuts' },
                    ...STATUS_OPTIONS,
                  ]}
                />
              </FilterField>
            </div>
            <div className="shrink-0 md:hidden">
              <Popover
                open={filterPopoverOpen === 'status'}
                onOpenChange={(o) => setFilterPopoverOpen(o ? 'status' : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    aria-label="Filtrer par statut"
                  >
                    <Activity size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Statut</div>
                  {[
                    { value: 'all' as const, label: 'Tous les statuts' },
                    ...STATUS_OPTIONS,
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setFilterPopoverOpen(null);
                      }}
                      className={cn(
                        'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                        statusFilter === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <TabSwitcher<'table' | 'cards'>
          options={[
            { value: 'table', label: 'Tableau' },
            { value: 'cards', label: 'Cartes' },
          ]}
          value={viewMode}
          onChange={setViewMode}
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          {filteredContacts.length !== contacts.length && ` sur ${contacts.length}`}
        </span>
      </div>

      {viewMode === 'table' ? (
      <div className="rounded-xl overflow-x-auto">
        <Table
          variant="default"
          resizable={false}
          statusColumn={false}
          expandable
          selectionColumn
          fillColumn={false}
          selectAllChecked={allSelected}
          onSelectAllChange={(checked) =>
            setSelectedIds(checked ? new Set(sortedContacts.map((c) => c.id)) : new Set())
          }
        >
          <TableHeader>
            <TableRow hoverCellOnly>
              <TableHead
                minWidth={140}
                defaultWidth={200}
                sortable
                onSortClick={() => handleSort('name')}
              >
                Nom
              </TableHead>
              <TableHead
                minWidth={100}
                defaultWidth={120}
                sortable
                onSortClick={() => handleSort('type')}
              >
                Type
              </TableHead>
              <TableHead
                minWidth={80}
                defaultWidth={100}
                sortable
                onSortClick={() => handleSort('status')}
              >
                Statut
              </TableHead>
              <TableHead
                minWidth={160}
                defaultWidth={220}
                sortable
                onSortClick={() => handleSort('email')}
              >
                Mail
              </TableHead>
              <TableHead
                minWidth={120}
                defaultWidth={140}
                sortable
                onSortClick={() => handleSort('phone')}
              >
                Téléphone
              </TableHead>
              <TableHead align="center" minWidth={48} defaultWidth={48} maxWidth={48} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...sortedContacts, ...(pendingNewContact ? [pendingNewContact] : [])].map((contact) => {
              const isPending = contact.id === PENDING_ID;
              const isExpanded = expandedId === contact.id;
              return (
                <TableRow
                  key={contact.id}
                  clickable={!isPending}
                  selected={selectedIds.has(contact.id)}
                  favoriteConfig={!isPending ? {
                    isFavorite: !!contact.is_favorite,
                    onToggle: () => handleToggleFavorite(contact.id),
                  } : undefined}
                  onSelectChange={!isPending ? (checked) =>
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(contact.id);
                      else next.delete(contact.id);
                      return next;
                    })
                  : undefined}
                  expanded={isExpanded}
                  onExpandToggle={!isPending ? () => setExpandedId(isExpanded ? null : contact.id) : undefined}
                  expandContent={expandContent(contact)}
                >
                  <TableCell
                    noHoverBorder
                    editable
                    inputRef={editingCell?.id === contact.id && editingCell?.field === 'name' ? (inputRef as React.RefObject<HTMLInputElement | null>) : undefined}
                    value={
                      editingCell?.id === contact.id && editingCell?.field === 'name'
                        ? editValue
                        : (contact.name ?? '')
                    }
                    onChange={(e) => {
                      if (!(editingCell?.id === contact.id && editingCell?.field === 'name')) {
                        setEditingCell({ id: contact.id, field: 'name' });
                        setEditValue(contact.name ?? '');
                      }
                      setEditValue(e.target.value);
                    }}
                    onBlur={() => {
                      if (editingCell?.id === contact.id && editingCell?.field === 'name') {
                        if (isPending) {
                          handleSavePendingName();
                        } else {
                          handleUpdateField(contact.id, 'name', editValueRef.current.trim());
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        if (isPending) handleCancelPending();
                        else setEditingCell(null);
                      }
                    }}
                    placeholder="Nom"
                  />
                  <TableCell noHoverBorder>
                    {isPending ? (
                      <div className="flex items-center min-h-8 px-2 py-1">
                        <Badge variant={TYPE_BADGE_VARIANT[contact.type]} className="text-xs">
                          {getTypeLabel(contact.type)}
                        </Badge>
                      </div>
                    ) : (
                      <Popover
                        open={popoverOpen === `${contact.id}-type`}
                        onOpenChange={(o) => setPopoverOpen(o ? `${contact.id}-type` : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center justify-between gap-2 w-full min-h-8 min-w-0 px-2 py-1 text-left cursor-pointer rounded"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPopoverOpen(popoverOpen === `${contact.id}-type` ? null : `${contact.id}-type`);
                            }}
                          >
                            <Badge variant={TYPE_BADGE_VARIANT[contact.type]} className="text-xs">
                              {getTypeLabel(contact.type)}
                            </Badge>
                            <ChevronDown size={12} className="text-zinc-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="start">
                          {TYPE_OPTIONS.map((opt) => (
                            <Button
                              key={opt.value}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleUpdateField(contact.id, 'type', opt.value);
                                setPopoverOpen(null);
                              }}
                              className={cn(
                                'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                                contact.type === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                              )}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </TableCell>
                  <TableCell noHoverBorder>
                    {isPending ? (
                      <div className="flex items-center min-h-8 px-2 py-1">
                        <Badge variant={STATUS_BADGE_VARIANT[contact.status]} className="text-xs">
                          {getStatusLabel(contact.status)}
                        </Badge>
                      </div>
                    ) : (
                      <Popover
                        open={popoverOpen === `${contact.id}-status`}
                        onOpenChange={(o) => setPopoverOpen(o ? `${contact.id}-status` : null)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center justify-between gap-2 w-full min-h-8 min-w-0 px-2 py-1 text-left cursor-pointer rounded"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPopoverOpen(popoverOpen === `${contact.id}-status` ? null : `${contact.id}-status`);
                            }}
                          >
                            <Badge variant={STATUS_BADGE_VARIANT[contact.status]} className="text-xs">
                              {getStatusLabel(contact.status)}
                            </Badge>
                            <ChevronDown size={12} className="text-zinc-400 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="start">
                          {STATUS_OPTIONS.map((opt) => (
                            <Button
                              key={opt.value}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleUpdateField(contact.id, 'status', opt.value);
                                setPopoverOpen(null);
                              }}
                              className={cn(
                                'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                                contact.status === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                              )}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </TableCell>
                  {isPending ? (
                    <TableCell noHoverBorder>
                      <span className="text-zinc-400 italic text-sm">Email</span>
                    </TableCell>
                  ) : (
                  <TableCell
                    noHoverBorder
                    editable
                    value={
                      editingCell?.id === contact.id && editingCell?.field === 'email'
                        ? editValue
                        : (contact.email ?? '')
                    }
                    onChange={(e) => {
                      if (!(editingCell?.id === contact.id && editingCell?.field === 'email')) {
                        setEditingCell({ id: contact.id, field: 'email' });
                        setEditValue(contact.email ?? '');
                      }
                      setEditValue(e.target.value);
                    }}
                    onBlur={() => {
                      if (editingCell?.id === contact.id && editingCell?.field === 'email') {
                        handleUpdateField(contact.id, 'email', editValueRef.current.trim());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setEditingCell(null);
                      }
                    }}
                    placeholder="Email"
                  />
                  )}
                  {isPending ? (
                    <TableCell noHoverBorder>
                      <span className="text-zinc-400 italic text-sm">Téléphone</span>
                    </TableCell>
                  ) : (
                  <TableCell
                    noHoverBorder
                    editable
                    value={
                      editingCell?.id === contact.id && editingCell?.field === 'phone'
                        ? editValue
                        : (contact.phone ?? contact.mobile ?? '')
                    }
                    onChange={(e) => {
                      if (!(editingCell?.id === contact.id && editingCell?.field === 'phone')) {
                        setEditingCell({ id: contact.id, field: 'phone' });
                        setEditValue(contact.phone ?? contact.mobile ?? '');
                      }
                      setEditValue(e.target.value);
                    }}
                    onBlur={() => {
                      if (editingCell?.id === contact.id && editingCell?.field === 'phone') {
                        handleUpdateField(contact.id, 'phone', editValueRef.current.trim());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        setEditingCell(null);
                      }
                    }}
                    placeholder="Téléphone"
                  />
                  )}
                  <TableCell noHoverBorder align="center" className="w-12">
                    {isPending ? (
                      <button
                        type="button"
                        className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        aria-label="Annuler"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelPending();
                        }}
                      >
                        <span className="text-xs font-medium">Annuler</span>
                      </button>
                    ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover/row:opacity-100"
                          aria-label="Actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-40 p-1">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                          onClick={(e) => handleRequestDelete(contact, e)}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </PopoverContent>
                    </Popover>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            <tr
              className="border-t border-dashed border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              onClick={handleAddContact}
            >
              <td colSpan={7} className="p-0">
                <div className="flex items-center gap-2 min-h-8 px-3 py-2 text-zinc-400">
                  <Plus size={16} />
                  <span className="text-sm font-semibold">Ajouter un contact</span>
                </div>
              </td>
            </tr>
          </TableBody>
        </Table>
      </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {[...sortedContacts, ...(pendingNewContact ? [pendingNewContact] : [])].map((contact) => {
          const isPending = contact.id === PENDING_ID;
          return (
            <EditableCard
              key={contact.id}
              isEditing={editingCardId === contact.id || isPending}
              onEdit={() => !isPending && setEditingCardId(contact.id)}
              onCloseEdit={() => (isPending ? handleCancelPending() : setEditingCardId(null))}
              onDelete={!isPending ? (e) => handleRequestDelete(contact, e as React.MouseEvent) : undefined}
              headerPadding="sm"
              headerContent={
                <>
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mr-3">
                    <User size={18} className="text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      {!isPending && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(contact.id); }}
                          className={cn(
                            'shrink-0 p-0.5 rounded transition-colors',
                            contact.is_favorite ? 'text-amber-500' : 'text-zinc-400 hover:text-amber-500'
                          )}
                          aria-label={contact.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star size={14} className={cn(contact.is_favorite && 'fill-current')} />
                        </button>
                      )}
                      <p className="text-sm font-medium leading-snug truncate min-w-0">
                        {contact.name || (isPending ? 'Nouveau contact' : '—')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mt-1.5">
                      <Badge variant={TYPE_BADGE_VARIANT[contact.type]} className="text-[10px] shrink-0">
                        {getTypeLabel(contact.type)}
                      </Badge>
                      <Badge variant={STATUS_BADGE_VARIANT[contact.status]} className="text-[10px] shrink-0">
                        {getStatusLabel(contact.status)}
                      </Badge>
                    </div>
                  </div>
                </>
              }
              editContent={expandContent(contact, 'stack')}
            />
          );
        })}
        {viewMode === 'cards' && !pendingNewContact && (
          <Card
            variant="default"
            role="button"
            tabIndex={0}
            className="flex cursor-pointer border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            onClick={handleAddContact}
            onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
          >
            <div className="p-3 flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">Ajouter un contact</p>
              </div>
            </div>
          </Card>
        )}
      </div>
      )}

      <Modal
        isOpen={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        title="Supprimer le contact"
        size="sm"
      >
        <ModalContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Êtes-vous sûr de vouloir supprimer &quot;{contactToDelete?.name || 'ce contact'}&quot; ? Cette action est irréversible.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setContactToDelete(null)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <Trash2 size={14} className="mr-1.5" />
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
